# AGENTS.md

<!-- 推奨行数：60〜100行 -->
<!-- このファイルはAIエージェントが自動で読み込む「作業指示書」-->
<!-- 詳細ドキュメントへの参照を書く。詳細をここに書かない（段階的開示）-->

## Project Overview

<!-- 記入方法：以下のプロンプトをAIに渡す
「AGENTS.md の Project Overview と Commands を記入してください。
 docs/project-definition.md と ARCHITECTURE.md を参照しながら、
 以下を1つずつ質問して埋めてください：
 1. プロジェクト名と目的（1〜2文）
 2. 技術スタックとバージョン
 3. 実行コマンド（install/dev/build/typecheck/lint/test）
 4. 依存の方向（ARCHITECTURE.mdから転記）
 5. 現在取り組んでいるタスク
 質問は1つずつ。私が答えるまで次に進まないでください。
 記入完了後、.claude/project-context.md の記入も案内してください。」
-->

[プロジェクト名]：[何のためのプロジェクトか1〜2文。技術スタックとバージョンも含める]

## Commands

<!-- エージェントが実行すべきコマンドを完全な形で書く -->
- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Type check: `pnpm typecheck`
- Lint: `pnpm lint`
- Test: `pnpm test`
- Test (single file): `pnpm test -- [ファイルパス]`
- Deploy: [デプロイコマンド。未定の場合は空欄]

## Architecture

詳細は `ARCHITECTURE.md` を参照。

依存の方向（変更禁止）：[層A] → [層B] → [層C]

## Code Style

詳細は `.claude/coding-conventions.md` を参照。

- ディレクトリ名：kebab-case
- コンポーネント：PascalCase.tsx
- hooks：camelCase.ts（use prefix必須）
- 定数：UPPER_SNAKE_CASE（constants/に定義）

## Boundaries（禁止事項）

<!-- 最重要。省略しない -->
<!-- 実装テンプレート：[DEV_STANDARDS_PATH]/principles/security-implementation.md -->
<!-- 優先度・投資判断に迷ったとき：[DEV_STANDARDS_PATH]/principles/risk-based-approach.md -->
<!-- コード品質の基準：[DEV_STANDARDS_PATH]/principles/code-quality.md -->
- `.env*` ファイルを変更・コミットしない
- 機密情報をコードにハードコードしない・ログに出力しない
- `any` 型を使用しない
- マジックナンバーをコードに直書きしない（constants/に移す）
- テストコードを無断変更しない
- 指示されていない機能・抽象化・最適化を追加しない（YAGNI）
- 不明点は推測で実装せず、実装前に質問する
- セキュリティ問題を後回しにしない
- テストが通らない変更を本番に適用しない
- 1コミットに複数の目的の変更を混ぜない

## TDD Cycle

詳細は `[DEV_STANDARDS_PATH]/principles/tdd-with-ai.md` を参照。
実装完了後の確認順序（tsc → ESLint → テスト → @code-reviewer → 人間レビュー）も同ファイルに定義。

**TDDサイクルのStep2（テストコードの生成）**：
→ `@test-generator` を呼び出す

**バグを修正するとき**：
→ 修正の前に、バグを再現するテストを先に書く。`@test-generator` を呼び出す

## Subagents

<!-- 前提条件：以下の3箇所がすべてプレースホルダーから実際の内容に書き換えられているときのみ機能する -->
<!-- 1. [プロジェクト名] → 実際のプロジェクト名と説明 -->
<!-- 2. 依存の方向：[層A] → [層B] → [層C] → 実際の層名 -->
<!-- 3. Taking on: [取り組んでいる機能] → 実際のタスク -->
<!-- 上記が未記入のままの場合、このセクションを無視してARCHITECTURE.mdの記入を先に促す -->

**以下の両方を満たす実装依頼を受けたとき**：
1. ユーザーのメッセージが機能の列挙・スプリント計画・完了の定義を含んでいない（仕様が1〜4文程度）
2. 複数のファイル変更・複数の機能・複数のステップが必要と判断できる
→ 実装を開始する前に `@planner` を呼び出して仕様書（docs/spec.md）を作成する

**スプリント完了後**（@plannerで定義したスプリントが完了したとき）：
→ `@evaluator` を呼び出してQA評価を行う

**調査が必要なとき**（「この機能はどこか」「影響範囲はどこか」を把握する必要があるとき）：
→ `@codebase-investigator` を呼び出す。メインのコンテキストで大量ファイルを読まない

**今のセッションで認証・認可・機密データ・入力バリデーションの実装を行ったとき**：
→ Report Formatの後に必ず `@security-auditor` を呼び出す

**今のセッションで本番環境が稼働中のコードを変更するとき**：
→ 変更前に `.claude/skills/live-operation/` の Pre-Change Checklist を実行する

## Current Task

<!-- 毎セッション開始時に更新する。.claude/project-context.md の「現在のタスク」も同じ内容に合わせて更新する -->
**Taking on**: [取り組んでいる機能]
**Done**: [完了部分]
**Next**: [次にやること]

## Session Protocol

**セッション開始時**：`.claude/handoff-artifact.md` を読んで前のセッションの文脈を復元する。
その後、Current Task と `.claude/project-context.md` の「現在のタスク」を現在の状態に更新する。

**セッション終了時**：`Stop` イベントのHook（`.claude/hooks/post-session.sh`）が自動で
`.claude/handoff-artifact.md` を生成する。
Hookを設定していない場合はAIに「handoff-artifact.mdを更新して」と依頼する。

## Report Format

実装・変更の完了時は必ず以下の形式で報告し、`@code-reviewer` を呼び出す：
```
変更ファイル：[パス] - [概要]
テスト結果：[通過N件 / 失敗N件]
層のルール：[問題なし / 問題あり（詳細）]
影響範囲：[変更が影響するコンポーネント]
ロールバック：git revert [コミットID]（本番稼働中の場合のみ記載）
懸念点：[あれば記載。なければ「なし」]
要記録判断：[ライブラリ選定・データモデル・認証方式・外部サービス契約・方針変更があれば
            decisions/ への記録を提案する。なければ「なし」]
```

<!-- decisions/ テンプレート：[DEV_STANDARDS_PATH]/snippets/tech-decision.md.template -->
<!-- 保存先：decisions/[連番]-[内容を表すslug].md -->
