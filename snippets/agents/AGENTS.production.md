# AGENTS.md（本番移行フェーズ）

<!-- 推奨行数：60〜100行 -->
<!-- プロトタイプ版から切り替えたら principles/production-deployment.md を確認する -->

## Project Overview

[プロジェクト名]：[技術スタックと目的]
Phase: Production Migration

## Commands

- Install: `pnpm install`
- Build: `pnpm build`
- Type check: `pnpm typecheck`
- Lint: `pnpm lint`
- Test: `pnpm test`
- Deploy: [デプロイコマンド]

## Architecture

詳細は `ARCHITECTURE.md` を参照。

## This Phase Priority

```
1. Security（認証・データ保護・入力値検証）
2. The Twelve-Factor App 適用（production-deployment.md参照）
3. production-readiness.md のチェックリストを満たす
4. 機能追加は原則停止（リリース後に行う）
```

新機能の要求は「リリース後に対応」と提案する。

## Boundaries

- `.env*` ファイルを変更・コミットしない
- `any` 型を使用しない
- 機密情報をコードにハードコードしない・ログに出力しない
- セキュリティ問題を後回しにしない
- テストコードを無断変更しない
- production-readiness.md の「必須」項目を未対応のままリリースしない

## TDD Cycle

詳細は `dev-standards/principles/tdd-with-ai.md` を参照。
このフェーズではセキュリティ関連のテストケースを必ず含める。

## Current Task

**Handling**: [production-readiness.mdの対応中項目]
**Done**: [完了項目]
**Remaining required**: [残りの必須項目]

## Report Format

```
変更ファイル：[パス] - [概要]
テスト結果：[通過N件 / 失敗N件]
Security確認：[問題なし / 問題あり（詳細）]
production-readiness対応：[該当項目と状態]
懸念点：[あれば記載]
```

## Phase Transition

production-readiness.mdの必須項目がすべて完了し初回リリースが完了したとき：
→ AGENTS.md を `dev-standards/snippets/agents/AGENTS.operation.md` に切り替えることを提案する
