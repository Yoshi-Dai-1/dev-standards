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

詳細は `[DEV_STANDARDS_PATH]/principles/tdd-with-ai.md` を参照
（セッション開始時にパスをAIに伝えるか、ファイルを直接渡す）。
このフェーズではセキュリティ関連のテストケースを必ず含める。

**TDDサイクルのStep2（テストコードの生成）**：
→ `@test-generator` を呼び出す

## Subagents

<!-- 以下のトリガー条件に該当したとき、AIが自律的に呼び出す -->

**認証・認可・入力バリデーション・エラーハンドリングを実装したセッションの完了時**：
→ Report Formatの後に必ず `@security-auditor` を呼び出す

**影響範囲の把握が必要なとき**（本番への変更前・依存関係の確認が必要なとき）：
→ `@codebase-investigator` を呼び出す。メインのコンテキストで大量ファイルを読まない

**production-readiness.mdの必須項目がすべて完了し、初回リリース直前のとき**：
→ `@resilience-checker` を呼び出してリリース前の最終確認を行う

## Security Implementation

認証・認可・入力バリデーション・エラーハンドリングを実装するとき：
→ `[DEV_STANDARDS_PATH]/principles/security-implementation.md` のテンプレートを使う

何を優先するか判断に迷ったとき：
→ `[DEV_STANDARDS_PATH]/principles/risk-based-approach.md` のリスク4象限で判断する
→ 「即死系」の項目（セキュリティ・法的要件）は妥協しない

## Current Task

**Handling**: [production-readiness.mdの対応中項目]
**Done**: [完了項目]
**Remaining required**: [残りの必須項目]

## Session Protocol

**セッション開始時**：人間が `.claude/handoff-artifact.md` をAIに渡して前のセッションの文脈を復元する。
その後、Current Task と `.claude/project-context.md` の「現在のタスク」を現在の状態に更新する。

**セッション終了時**：`Stop` イベントのHook（`.claude/hooks/post-session.sh`）が自動で `.claude/handoff-artifact.md` を生成する。
Hookを設定していない場合はAIに「handoff-artifact.mdを更新して」と依頼する。

**`docs/operations.md` の記入**：デプロイ方法・ロールバック手順・障害対応手順が決まった時点で、AIと対話しながら `docs/operations.md` に記入する。本番リリース前までに完成させる。

## Report Format

実装完了時は必ず以下の形式で報告し、`@code-reviewer` を呼び出す：
```
変更ファイル：[パス] - [概要]
テスト結果：[通過N件 / 失敗N件]
Security確認：[問題なし / 問題あり（詳細）]
production-readiness対応：[該当項目と状態]
懸念点：[あれば記載]
```

## Phase Transition

production-readiness.mdの必須項目がすべて完了し初回リリースが完了したとき：
→ プロジェクトルートで以下を実行してAGENTS.mdを運用フェーズ用に切り替えることを提案する：
```
DEV_STANDARDS_PATH=[dev-standardsのパス] bash [dev-standardsのパス]/setup-harness.sh operation
```
実行後、AGENTS.md の Current Task・Pending を現在の状態に記入し直す。
