import type { Plugin } from "@opencode-ai/plugin"

/**
 * arch-diag.ts
 *
 * ARCHITECTURE.md の技術スタック変更を検知し、関連スキルの確認を促す。
 * アーキテクチャ違反検出が未設定の場合、設定を促す。
 *
 * 2026-08 過剰発火対策（初回セッションで 37件 → 記入中0件 / 変更時1件 / 無関係編集0件）:
 * - 記入中抑制: セットアップ記入中（`## 人間とAIが対話しながら記入する手順` / `<!--` / `[...]`）は通知しない
 * - 変更検知: 技術スタックセクションをセッション毎に比較し、実際に内容が変わったときだけ通知
 * - ENF（違反検出未設定）はセッション内1回 + コンパクションでリセット（コンパクション後は1回だけ再発火）
 * - 10分クールダウンは TECH 通知専用（rule-injector の RULE_COOLDOWN_MS と同型）。ENF はクールダウンを使わない
 *
 * P1-3 修正（2026-06）：AI 通知パターンに統一
 * - 旧：`client.app.log` のみ（OpenCode のログファイルに書き出すだけ。AI も人間も気づかない）
 * - 新：`client.tui.showToast` + `client.session.prompt` で AI に通知
 * - 他の Plugin（lint-and-typecheck.ts、harness-health.ts など）と同じパターン
 */

// 記入中マーカー：テンプレートの記入プロセスが完了していないことを示す。
// ADR 004 と AGENTS.md 0-f の完了条件（`## 人間とAIが対話しながら記入する手順` 削除 /
// HTMLコメント全削除 / プレースホルダー全置換）と一致する。
const SETUP_MARKERS = [
  /##\s+人間とAIが対話しながら記入する手順/,
  /<!--/,
  /\[\.\.\.\]/,
]

const RULE_COOLDOWN_MS = 10 * 60 * 1000 // TECH 通知専用。技術スタック変更通知を10分に1回に抑制するクールダウン

interface ArchSessionState {
  // 技術スタックセクションの直前内容。コンパクションではリセットしない（同値での再発火を防ぐ）
  techBaseline: string | null
  // ENF（アーキテクチャ違反検出未設定）を通知済みか。コンパクションでリセット
  enfFired: boolean
  lastTechAt: number
}

const sessions = new Map<string, ArchSessionState>()

function getSession(sessionId: string): ArchSessionState {
  let s = sessions.get(sessionId)
  if (!s) {
    s = { techBaseline: null, enfFired: false, lastTechAt: 0 }
    sessions.set(sessionId, s)
  }
  return s
}

// 技術スタックに関連する内容だけを抽出する（セクション本文 + フレームワーク/言語テーブル行）。
// 無関係セクション（セキュリティ要件など）の編集では変化しないため、変更検知の基準に使える。
function extractTechContent(content: string): string {
  const lines = content.split("\n")
  const out: string[] = []
  let inSection = false

  for (const line of lines) {
    if (/^#{1,2}\s+(技術スタック|Tech Stack)\s*$/i.test(line)) {
      inSection = true
      continue
    }
    if (inSection && /^##\s+/.test(line)) {
      inSection = false
    }
    if (inSection) {
      out.push(line.trim())
      continue
    }
    if (/^\|\s*(フレームワーク|Framework|言語|Language|Database|Storage|Cache)\s+\|/i.test(line)) {
      out.push(line.trim())
    }
  }
  return out.join("\n").trim()
}

function resetAfterCompaction(sessionId: string) {
  const s = sessions.get(sessionId)
  if (!s) return
  // ENF フラグとクールダウンのみリセット。技術スタックのベースラインは保持（同値での再発火を防ぐ）
  s.enfFired = false
  s.lastTechAt = 0
}

async function isEnforcementMissing(content: string, $: any): Promise<boolean> {
  const layerRowPattern = /^\|\s*\w+\s+\|\s*`[^`]+`\s+\|/m
  const hasPlaceholderLayers = /\[層[A-D]\]/.test(content)
  if (!layerRowPattern.test(content) || hasPlaceholderLayers) return false

  let enforcementFound = false

  if (/TypeScript|JavaScript/i.test(content)) {
    for (const cfg of ['eslint.config.mjs', 'eslint.config.js', '.eslintrc.json', 'eslint.config.cjs']) {
      const r = await $`test -f ${cfg}`.nothrow().quiet()
      if (r.exitCode !== 0) continue
      const cfgContent = await Bun.file(cfg).text().catch(() => '')
      if (cfgContent.includes('no-restricted-imports') || cfgContent.includes('boundaries')) {
        enforcementFound = true
        break
      }
    }
  }

  if (!enforcementFound && /Python/i.test(content)) {
    const r = await $`test -f pyproject.toml`.nothrow().quiet()
    if (r.exitCode === 0) {
      const tomlContent = await Bun.file('pyproject.toml').text().catch(() => '')
      if (tomlContent.includes('TID251') || tomlContent.includes('flake8-tidy-imports')) {
        enforcementFound = true
      }
    }
  }

  if (!enforcementFound) {
    const manualLangs = ['Go', 'Rust', 'Ruby', 'Swift', 'Kotlin', 'Java', 'PHP']
    const hasLangWord = manualLangs.some((l) => new RegExp(`\\b${l}\\b`, 'i').test(content))
    const hasCFamily = /(?:^|\s)C(?:\+\+|#)?(?:\s|$)/m.test(content)
    if (hasLangWord || hasCFamily) {
      if (content.includes('@code-quality-auditor')) {
        enforcementFound = true
      }
    }
  }

  return !enforcementFound
}

export const ArchDiagPlugin: Plugin = async ({ client, $ }) => ({
  "tool.execute.after": async (input) => {
    if (!["write", "edit", "multiedit"].includes(input.tool)) return

    const sessionId = input.sessionID
    if (!sessionId) return

    const candidatePaths: string[] = []
    if (input.tool === "multiedit") {
      const ops = input.args?.operations || []
      for (const op of ops) {
        const p = op?.filePath || op?.path
        if (p) candidatePaths.push(p)
      }
    } else {
      const p = input.args?.filePath || input.args?.path
      if (p) candidatePaths.push(p)
    }

    const archPaths = [...new Set(candidatePaths)].filter((fp) => /\bARCHITECTURE\.md$/i.test(fp))
    if (archPaths.length === 0) return

    for (const fp of archPaths) {
      const content = await Bun.file(fp).text().catch(() => "")
      if (!content) continue

      // === 記入中（セットアップ中）は通知しない ===
      if (SETUP_MARKERS.some((m) => m.test(content))) continue

      const session = getSession(sessionId)
      const now = Date.now()

      // === 技術スタック変更検知（セッション毎の直前内容比較） ===
      const techContent = extractTechContent(content)
      if (techContent) {
        if (session.techBaseline === null) {
          // 初回観測：ベースラインを設定するだけ（ノイズ抑制）
          session.techBaseline = techContent
        } else if (techContent !== session.techBaseline) {
          session.techBaseline = techContent
          if (now - session.lastTechAt >= RULE_COOLDOWN_MS) {
            session.lastTechAt = now
            await client.tui.showToast({
              body: {
                message: "arch-diag: `ARCHITECTURE.md` の技術スタックが変更されました",
                variant: "info",
              },
            })
            await client.session.prompt({
              path: { id: sessionId },
              body: {
                noReply: true,
                parts: [
                  {
                    type: "text",
                    text:
                      `\`ARCHITECTURE.md\` の技術スタックセクションが変更されました。\n` +
                      `推奨アクション：\n` +
                      `1. Skill ツールで skill_name="find-skills" を実行し、関連スキルを追加検討\n` +
                      `2. @planner に新スタックでの実装影響を確認\n` +
                      `3. 影響範囲に応じて \`.opencode/standards/principles/security-requirements.md\` / \`.opencode/standards/principles/network-resilience.md\` の参照を更新\n` +
                      `この変更が古いハーネス構成と整合しない場合、ハーネス健全性チェックも実施してください。`,
                  },
                ],
              },
            })
          }
        }
      }

      // === ENF（アーキテクチャ違反検出未設定）チェック: セッション内1回 ===
      if (!session.enfFired && (await isEnforcementMissing(content, $))) {
        session.enfFired = true
        await client.tui.showToast({
          body: {
            message: "arch-diag: アーキテクチャ違反検出が未設定です",
            variant: "warning",
          },
        })
        await client.session.prompt({
          path: { id: sessionId },
          body: {
            noReply: true,
            parts: [
              {
                type: "text",
                text:
                  `⚠️ アーキテクチャ違反検出が未設定です\n\n` +
                  `\`ARCHITECTURE.md\` に層のルールが定義されていますが、依存方向の違反を自動検出する設定がありません。\n\n` +
                  `対処：\`.opencode/instructions/stack-setup.md\` Step 4（\`.opencode/instructions/stack-setup/_step-36-arch.md\`）を実行し、\n` +
                  `アーキテクチャ違反検出を設定してください。\n\n` +
                  `設定後はコード編集のたびに lint-and-typecheck.ts Plugin が自動で違反を検出します。\n` +
                  `設定しない場合、層違反に気づかないまま開発が進み、後からの修正が困難になります。`,
              },
            ],
          },
        })
      }
    }
  },
  // コンパクション検知：ENF フラグとクールダウンをリセット（コンパクション後の AI 記憶喪失に対応）
  "experimental.session.compacting": async (input) => {
    const sessionId = input.sessionID
    if (sessionId) resetAfterCompaction(sessionId)
  },
  // 安定APIフォールバック：session.compacted イベントでもリセット。session.deleted で状態を破棄する
  event: async (input) => {
    const ev = input.event
    if (!ev) return
    if (ev.type === "session.compacted") {
      resetAfterCompaction(ev.properties.sessionID)
    } else if (ev.type === "session.deleted") {
      // セッション削除時に状態を破棄（メモリリーク防止）
      sessions.delete(ev.properties.info.id)
    }
  },
})
