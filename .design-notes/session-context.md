# Session Context

## ステージ済みの変更
- `opencode/snippets/.opencode/plugins/arch-diag.ts`: 過剰発火対策を実装（記入中抑制 / 変更検知 = セッション毎の直前内容比較 / ENF セッション内1回 / 10分クールダウン / コンパクションリセット）。日本語見出し `\b` バグを修正（`/^#{1,2}\s+(技術スタック|Tech Stack)\s*$/i`）、未使用定数 `TECH_SECTION_PATTERNS` を削除。`session.deleted` で状態破棄
- `opencode/snippets/.opencode/plugins/rule-injector.ts`: `resetAfterCompaction()` を追加（injected / reminded / readByAI / lastInjectedAt / securityAuditInjected）。`event` フックで session.idle（セキュリティ催促）と session.deleted（状態破棄）を購読
- `opencode/snippets/.opencode/plugins/README.md`: イベント表・`event` フック説明を更新。`session.idle` は Hooks 型未宣言のため `event` 経由購読と明記。型チェック手順（`--types bun`）を追記
- `opencode/snippets/.opencode/plugins/doc-links.ts`: multiedit 対応（`operations[]` 走査）+ `findBrokenLinks()` を前方へ移動
- `opencode/snippets/.opencode/plugins/harness-health.ts`: multiedit 対応 + 通知文字列の入れ子バッククォート構文エラー（既存バグ）修正 + volume 閾値 `===`→`>=` + `volumeAlerted` フラグ + `event` で session.idle（pass 率通知）/ session.deleted
- `opencode/snippets/.opencode/plugins/adr-prompt.ts`: per-session 化 + コンパクションリセット + `deleteSessionState()`（session.deleted）
- `opencode/snippets/.opencode/plugins/working-dir-guide.ts`: Read 初回注入キャッシュのコンパクションリセット + `KEY_SEP` で前方一致問題解消 + session.deleted
- `opencode/snippets/.opencode/plugins/env-check.ts`: .nvmrc 不一致警告をセッション内1回化 + コンパクションリセット + session.deleted + `.text` → `.text()`（実 Bun で実行時クラッシュ修正）
- `opencode/snippets/.opencode/plugins/task-archive.ts`: `Bun.dir("docs/working")` → `"docs/working"`（実行時 undefined 修正）+ `event` フックへ移行
- `opencode/snippets/.opencode/plugins/commit-review.ts`: `input.args` → `output.args`（コミット検知が元々動作しない潜伏バグ修正）+ `.text()` ×2
- `opencode/snippets/.opencode/plugins/lint-and-typecheck.ts`: `r.text.substring` → `r.text().substring` を8箇所（実 Bun の実行時クラッシュ修正）
- `opencode/snippets/.opencode/plugins/compaction-context.ts`: 「task-archive.ts が session.idle で提案」→「アイドル時に提案」
- `opencode/snippets/.opencode/package.json`: `@types/bun` を devDependencies に追加（型チェック用。実行時には影響しない）
- `opencode/snippets/.opencode/bun.lock`: 新規（`bun install` で生成される Bun の依存ロックファイル。yori 開発時の再現性担保。配布先へはコピーされない）
- `opencode/setup-harness.sh`: `set -e` 下で `diff` の終了コード1（ファイル差分）により再実行が中断するバグを修正（principles/architectures マージループの diff に `|| true` を付与）
- `opencode/principles/harness-engineering.md`: 「task-archive.ts Plugin が session.idle 検知時」→「アイドル検知（`session.idle` イベント購読）時」に2箇所言い換え（原則文書を実装非依存に）
- `.design-notes/session-context.md`: 本ファイル更新

## 未解決の課題
- なし（テストハーネス全件 PASS）

## 次のセッションでやること
- ステージ済み変更のコミット可否を人間に確認する（commit/push は人間の指示があるまで実行しない）

## 検証メモ（2026-08-11）
- テストハーネス: `/var/folders/2r/4xmj5zsd5736vnnwzp3gj1x40000gn/T/opencode/archdiag-test/`
  - `test-arch-diag.ts` 13件 / `test-rule-injector.ts` 3件 / `test-template.ts` 1件 / `test-plugins-consistency.ts` 27件 PASS（計44件）
  - 追加テスト: multiedit 閾値飛び越え / volume セッション内1回 / env-check session.deleted / working-dir-guide KEY_SEP・session.deleted / adr-prompt session.deleted / harness-health session.idle（event 経由）
- 全 Plugin typecheck: `bunx --bun tsc --noEmit --strict --skipLibCheck --types bun plugins/*.ts` でエラーゼロ
- v1120test 再配布: EXIT=0。plugins 全一致、package.json 一致、AGENTS.md（md5 dc589da5）/ ARCHITECTURE.md（md5 445fd82e）は上書き保護で変更なし
- import 精査: 19 Plugin 中 18 が `import type`（実行時消滅）。`evaluator-tools.ts` のみ `tool` を値 import（実行時解決が必要な可能性あり）
- setup-harness.sh は package.json のみコピーし bun.lock は配布しない。配布先では `bun install` が実行され配布先で bun.lock / node_modules が新規生成される（.gitignore で node_modules/ は除外済み。bun.lock は未除外）