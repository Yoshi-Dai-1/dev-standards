import type { Plugin } from "@opencode-ai/plugin"

const CODE_FILE_PATTERN = /\.(ts|js|tsx|jsx|py|go|rs|java|kt|c|cpp|cs|rb|swift|php|css|scss)$/

const TEST_FILE_PATTERN = /\.test\.(ts|js|tsx|jsx|py|go|rs|cpp|c|rb)$|_test\.(go|py|rs|cpp|c|rb)$|test_.*\.(py|rs|c|cpp)$|(\.|_)spec\.(ts|js|tsx|jsx|py|rb)$|(Test|Tests|Spec)\.(java|kt|cs|swift|php|c|cpp)$/i

// bash コマンドでのディレクトリ作成検知（scaffold・手動 mkdir の両方を対象）
const MKDIR_PATTERN = /\bmkdir\b/

// 初回コード書き込み時に読了を要求する規約ファイル。
// naming-conventions.md は opencode.json の instructions で常時読込されるためゲート対象外。
const CONVENTION_FILES = [
  { name: "directory-structure", filePath: ".opencode/instructions/directory-structure.md" },
  { name: "coding-conventions", filePath: ".opencode/coding-conventions.md" },
]

interface RuleDef {
  name: string
  filePath: string
  filePattern?: RegExp
  contentPatterns?: RegExp[]
}

const RULES: RuleDef[] = [
  {
    name: "code-quality",
    filePath: ".opencode/instructions/code-quality.md",
    filePattern: CODE_FILE_PATTERN,
  },
  {
    name: "security",
    filePath: ".opencode/instructions/security.md",
    filePattern: /\.(ts|js|tsx|jsx|py|go|rs|java|kt|c|cpp|cs|rb|swift|php)$|docs\/project-definition\.md$|AGENTS\.md$|package\.json$|requirements.*\.txt$|.*\.toml$|Gemfile$|composer\.json$|pubspec\.yaml$|.*\.csproj$|packages\.config$|go\.mod$|pom\.xml$|build\.gradle.*$/,
    contentPatterns: [
      /login/i, /auth/i, /signin/i, /password/i, /session/i, /(?:auth|access|refresh|session|csrf)[\s_-]?token/i,
      /jwt/i, /oauth/i, /api[_-]?key/i, /secret/i, /bearer/i,
      /authorization/i, /webhook/i, /credit/i, /card/i, /stripe/i,
      /payment/i, /billing/i, /charge/i, /checkout/i,
    ],
  },
  {
    name: "network-resilience",
    filePath: ".opencode/instructions/network-resilience.md",
    filePattern: /\.(ts|js|tsx|jsx|py|go|rs|java|kt|c|cpp|cs|rb|swift|php)$|ARCHITECTURE\.md$|docs\/project-definition\.md$/,
    contentPatterns: [
      /fetch/i, /axios/i, /requests/i, /http\.client/i, /net\/http/i,
      /reqwest/i, /HttpClient/i, /timeout/i, /retry/i,
      /circuit.?breaker/i, /redis/i, /rabbitmq/i, /kafka/i, /sqs/i,
    ],
  },
  {
    name: "design-contract",
    filePath: ".opencode/instructions/design-contract.md",
    filePattern: /\.(tsx|jsx|css|scss)$|DESIGN\.md$|design\/.*\.json$/,
  },
  {
    name: "stack-setup",
    filePath: ".opencode/instructions/stack-setup.md",
    filePattern: /ARCHITECTURE\.md$/i,
  },
  {
    name: "tdd-cycle",
    filePath: ".opencode/instructions/tdd-cycle.md",
    filePattern: TEST_FILE_PATTERN,
    contentPatterns: [/test/i, /spec/i, /tdd/i, /describe\(/i, /it\(/i, /assert/i, /expect/i, /func Test/i, /#\[test\]/i],
  },
]

interface RuleSessionState {
  injected: boolean
  readByAI: boolean
  reminded: boolean
  lastInjectedAt: number
}

const RULE_COOLDOWN_MS = 10 * 60 * 1000  // 同一ルールの再発報を抑制するクールダウン（10分）

interface SessionState {
  conventionsOffered: boolean
  conventionsRead: Set<string>
  rules: Map<string, RuleSessionState>
  securityContentMatched: boolean
  securityAuditInjected: boolean
}

const sessions = new Map<string, SessionState>()

function getSession(sessionId: string): SessionState {
  let s = sessions.get(sessionId)
  if (!s) {
    s = {
      conventionsOffered: false,
      conventionsRead: new Set(),
      rules: new Map(),
      securityContentMatched: false,
      securityAuditInjected: false,
    }
    sessions.set(sessionId, s)
  }
  return s
}

function getRuleState(session: SessionState, ruleName: string): RuleSessionState {
  let rs = session.rules.get(ruleName)
  if (!rs) {
    rs = { injected: false, readByAI: false, reminded: false, lastInjectedAt: 0 }
    session.rules.set(ruleName, rs)
  }
  return rs
}

// コンパクション後に呼ぶ。AI の記憶喪失に合わせて注入系フラグをリセットし、
// ルールの再注入・再リマインドを可能にする（arch-diag.ts と同型の対策）。
// コンパクション後は単発ハードゲート（規約未読ブロック）も再起動する。
function resetAfterCompaction(sessionId: string) {
  const s = sessions.get(sessionId)
  if (!s) return
  for (const rs of s.rules.values()) {
    rs.injected = false
    rs.readByAI = false
    rs.reminded = false
    rs.lastInjectedAt = 0
  }
  s.securityAuditInjected = false
  s.conventionsOffered = false
  s.conventionsRead.clear()
}

function extractFileAndContent(
  tool: string,
  args: Record<string, any>,
): Array<{ filePath: string; content: string }> {
  if (tool === "multiedit") {
    return (args.operations || []).map((op: any) => ({
      filePath: op.filePath || op.path || "",
      content: op.content || op.newString || "",
    }))
  }
  return [
    {
      filePath: args.filePath || args.path || "",
      content: tool === "write" ? args.content || "" : args.newString || args.content || "",
    },
  ]
}

function contentMatchesAny(content: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(content))
}

function isReadOfRule(fp: string, filePath: string): boolean {
  if (fp.includes(filePath)) return true
  const stripped = filePath.replace(/^\.opencode\//, "")
  if (fp.includes(stripped)) return true
  const bareName = stripped.split("/").pop() || ""
  if (bareName && fp.endsWith(bareName)) return true
  return false
}

export const RuleInjectorPlugin: Plugin = async ({ client }) => ({
  "tool.execute.before": async (input, output) => {
    const sessionId = (input as any).sessionID
    if (!sessionId) return

    // === Read tracking ===
    if (input.tool === "read") {
      const fp = output.args.filePath || output.args.path || ""
      if (!fp) return
      const session = getSession(sessionId)

      for (const cf of CONVENTION_FILES) {
        if (isReadOfRule(fp, cf.filePath)) {
          session.conventionsRead.add(cf.name)
        }
      }
      for (const rule of RULES) {
        if (isReadOfRule(fp, rule.filePath)) {
          getRuleState(session, rule.name).readByAI = true
        }
      }

      return
    }

    // === bash: mkdir 検知（ディレクトリ名の無防備な作成を防ぐ） ===
    if (input.tool === "bash") {
      const command = (output.args.command as string) || ""
      if (!MKDIR_PATTERN.test(command)) return
      const session = getSession(sessionId)
      if (!session.conventionsRead.has("directory-structure")) {
        throw new Error(
          `[rule-injector] ディレクトリ作成（mkdir）を検出しました。先に .opencode/instructions/directory-structure.md を読んでから作成してください。`,
        )
      }
      return
    }

    // === Write/edit/multiedit handling ===
    if (!["write", "edit", "multiedit"].includes(input.tool)) return

    const session = getSession(sessionId)
    const ops = extractFileAndContent(input.tool, output.args)

    for (const { filePath: fp, content } of ops) {
      if (!fp) continue

      // === First-write block for conventions ===
      // リトライバイパス修正：conventionsOffered は「全規約読了済み」を意味する。
      // 未読がある間はフラグを立てず throw し続ける（未読のまま再試行しても再度ブロックする）。
      if (!session.conventionsOffered && CODE_FILE_PATTERN.test(fp)) {
        const unread = CONVENTION_FILES.filter((cf) => !session.conventionsRead.has(cf.name))
        if (unread.length > 0) {
          throw new Error(
            `[rule-injector] 初回コードファイル書き込みを検出しました。以下のコーディング規約を読んでから再度作成してください：\n` +
              unread.map((cf) => `  - ${cf.filePath}`).join("\n"),
          )
        }
        session.conventionsOffered = true
      }

      // === tdd-cycle hard gate（テストファイル書き込み時） ===
      // テストファイルの作成・編集は tdd-cycle.md を読了するまでブロックする。
      if (TEST_FILE_PATTERN.test(fp) && !getRuleState(session, "tdd-cycle").readByAI) {
        throw new Error(
          `[rule-injector] テストファイルの書き込みを検出しました。先に .opencode/instructions/tdd-cycle.md を読んでから作成してください。`,
        )
      }

      // === Individual rule injection（バッチ化：複数該当時は1回の noReply に列挙） ===
      const messages: string[] = []
      for (const rule of RULES) {
        if (!rule.filePattern?.test(fp)) continue

        const state = getRuleState(session, rule.name)

        // クールダウン中はスキップ（同一ルールの連続発報を抑制）
        const now = Date.now()
        if (state.lastInjectedAt > 0 && now - state.lastInjectedAt < RULE_COOLDOWN_MS) continue

        if (!state.injected) {
          state.injected = true
          state.lastInjectedAt = now
          state.readByAI = false
          const tag = rule.contentPatterns ? "（内容依存・該当時のみ）" : ""
          messages.push(`[rule-injector] ${rule.name}: ${rule.filePath} を確認してください${tag}`)
        } else if (!state.readByAI && !state.reminded) {
          state.reminded = true
          state.lastInjectedAt = now
          messages.push(`[rule-injector] ${rule.name}: ${rule.filePath} が未読です — read して確認してください`)
        } else if (rule.contentPatterns && content && contentMatchesAny(content, rule.contentPatterns)) {
          state.readByAI = false
          state.lastInjectedAt = now
          if (rule.name === "security") {
            session.securityContentMatched = true
            messages.push(
              `[rule-injector] security: セキュリティ関連コード（login/auth/token/password 等）を検出しました。実装完了後は必ず @security-auditorを呼び出してレビューを受けてください。これは必須手順です。`,
            )
          } else {
            messages.push(
              `[rule-injector] ${rule.name}: ${rule.filePath} で定義されたパターンに該当するコードを検出しました — 該当ルールを再読してください`,
            )
          }
        }
      }
      if (messages.length > 0) {
        await client.session.prompt({
          path: { id: sessionId },
          body: {
            noReply: true,
            parts: messages.map((text) => ({ type: "text", text })),
          },
        })
      }
    }
  },
  // コンパクション検知：AI の記憶喪失に合わせて注入系フラグをリセット
  "experimental.session.compacting": async (input) => {
    const sessionId = (input as any)?.sessionID
    if (sessionId) resetAfterCompaction(sessionId)
  },
  // 安定APIフォールバック：session.compacted イベントでもリセット
  // あわせて session.idle でセキュリティレビュー催促、session.deleted で状態破棄を行う
  event: async (input) => {
    const ev = input.event
    if (!ev) return
    const sessionId = (ev as any).properties?.sessionID
    if (ev.type === "session.compacted") {
      if (sessionId) resetAfterCompaction(sessionId)
      return
    }
    if (ev.type === "session.deleted") {
      // セッション削除時に状態を破棄（メモリリーク防止）
      if (sessionId) sessions.delete(sessionId)
      return
    }
    if (ev.type === "session.idle") {
      if (!sessionId) return
      const s = sessions.get(sessionId)
      if (!s) return
      if (s.securityContentMatched && !s.securityAuditInjected) {
        s.securityAuditInjected = true
        await client.session.prompt({
          path: { id: sessionId },
          body: {
            noReply: true,
            parts: [
              {
                type: "text",
                text: `[rule-injector] security: このターンでセキュリティ関連コードを検出しました。@security-auditorを呼び出してセキュリティレビューを実施してください。これは必須手順です。`,
              },
            ],
          },
        })
      }
    }
  },
})
