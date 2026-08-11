import type { Plugin } from "@opencode-ai/plugin"

const TARGET_TOOLS = ["write", "edit", "multiedit"]
const THRESHOLD = 3

interface AdrSessionState {
  editCount: number
  hasPrompted: boolean
}

const sessions = new Map<string, AdrSessionState>()

function getSession(sessionId: string): AdrSessionState {
  let s = sessions.get(sessionId)
  if (!s) {
    s = { editCount: 0, hasPrompted: false }
    sessions.set(sessionId, s)
  }
  return s
}

// コンパクション後の AI 記憶喪失に合わせて、セッション内状態をリセットして
// 次の「複数ファイル編集」で再度 ADR 記録を促せるようにする。
function resetAfterCompaction(sessionId: string) {
  const s = sessions.get(sessionId)
  if (!s) return
  s.editCount = 0
  s.hasPrompted = false
}

// セッション削除時に状態を破棄（メモリリーク防止）
function deleteSessionState(sessionId: string) {
  sessions.delete(sessionId)
}

export const AdrPromptPlugin: Plugin = async ({ client }) => {
  return {
    "tool.execute.after": async (input) => {
      if (!TARGET_TOOLS.includes(input.tool)) return

      const sessionId = input.sessionID
      if (!sessionId) return

      const session = getSession(sessionId)
      if (session.hasPrompted) return

      session.editCount++
      if (session.editCount < THRESHOLD) return

      session.hasPrompted = true

      await client.session.prompt({
        path: { id: sessionId },
        body: {
          noReply: true,
          parts: [
            {
              type: "text",
              text: [
                "---adr-prompt---",
                "複数のファイルを編集しました。",
                "実装が完了したら AGENTS.md の Report Format に従って報告し、",
                "decisions/ への記録が必要な判断（ライブラリ選定・データモデル・",
                "認証方式・方針変更）があれば提案してください。",
                "---adr-prompt---",
              ].join("\n"),
            },
          ],
        },
      })
    },
    // コンパクション検知：per-session 状態をリセット（arch-diag.ts / rule-injector.ts と同型の対策）
    "experimental.session.compacting": async (input) => {
      const sessionId = (input as any)?.sessionID
      if (sessionId) resetAfterCompaction(sessionId)
    },
    // 安定APIフォールバック：session.compacted イベントでもリセット。session.deleted で状態を破棄する
    event: async (input) => {
      const ev = input.event
      if (!ev) return
      const sessionId = (ev as any).properties?.sessionID
      if (!sessionId) return
      if (ev.type === "session.compacted") {
        resetAfterCompaction(sessionId)
      } else if (ev.type === "session.deleted") {
        deleteSessionState(sessionId)
      }
    },
  }
}
