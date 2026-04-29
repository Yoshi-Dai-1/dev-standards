# AGENTS.md

<!-- 推奨行数：60〜100行 -->
<!-- このファイルはAIエージェントが自動で読み込む「作業指示書」 -->
<!-- 詳細ドキュメントへの参照を書く。詳細をここに書かない（段階的開示） -->

## Project Overview

<!-- このセクションをAIと対話しながら記入する場合は以下のプロンプトを使う：

「AGENTS.md の Project Overview と Commands を一緒に記入してください。

参照ファイル：
- docs/project-definition.md（プロジェクトの目的・要件）
- ARCHITECTURE.md（技術スタック・層のルール）

以下を1つずつ確認しながら埋めてください：
1. プロジェクト名と目的（1〜2文）
2. 技術スタックとバージョン（例：React 19 + Vite）
3. 実行コマンド（install / dev / build / typecheck / lint / test）
4. 依存の方向（ARCHITECTURE.mdから転記）
5. 現在取り組んでいるタスク

質問は1つずつ。私が答えるまで次に進まないでください。」
-->

[プロジェクト名]：[何のためのプロジェクトか1〜2文。技術スタックとバージョンも含める]
例：React 19 + Vite による日本語新聞スタイルの株式投資分析Webアプリ

## Commands

<!-- エージェントが実行すべきコマンドを完全な形で書く -->
- Install: `pnpm install`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Type check: `pnpm typecheck`
- Lint: `pnpm lint`
- Test: `pnpm test`
- Test (single file): `pnpm test -- [ファイルパス]`

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
- `.env*` ファイルを変更・コミットしない
- `any` 型を使用しない
- マジックナンバーをコードに直書きしない（constants/に移す）
- テストコードを無断変更しない（TDDサイクル中）
- 指示されていない機能・抽象化・最適化を追加しない（YAGNI）
- 不明点は推測で実装せず、実装前に質問する

## TDD Cycle

詳細は `[DEV_STANDARDS_PATH]/principles/tdd-with-ai.md` を参照。
実装完了後の確認順序（tsc → ESLint → テスト → @code-reviewer → 人間レビュー）も同ファイルに定義。

**TDDサイクルのStep2（テストコードの生成）**：
→ `@test-generator` を呼び出す

## Subagents

<!-- 以下のトリガー条件に該当したとき、AIが自律的に呼び出す -->

**タスク開始時**（ARCHITECTURE.mdが記入済みの状態で、新しい機能またはアプリの実装を開始するとき・数時間以上かかると判断したとき）：
→ `@planner` を呼び出して仕様書（docs/spec.md）を作成する

**スプリント完了後**（@plannerで定義したスプリントが完了したとき）：
→ `@evaluator` を呼び出してQA評価を行う

**調査が必要なとき**（「この機能はどこか」「影響範囲はどこか」を把握する必要があるとき）：
→ `@codebase-investigator` を呼び出す。メインのコンテキストで大量ファイルを読まない

**認証・機密データ・入力バリデーションを実装したセッションの完了時**：
→ Report Formatの後に必ず `@security-auditor` を呼び出す

**「最近コードが複雑になってきた」と感じたとき**：
→ `@code-quality-auditor` を呼び出す

## Security & Quality

<!-- 実装中の参照（原則の確認） -->
認証・機密データ・入力バリデーションを実装するとき：
→ `[DEV_STANDARDS_PATH]/principles/security-implementation.md` の実装テンプレートを使う

優先度・投資水準の判断に迷ったとき：
→ `[DEV_STANDARDS_PATH]/principles/risk-based-approach.md` のリスク4象限で判断する

実装中に「良いコードとは何か」を確認したいとき：
→ `[DEV_STANDARDS_PATH]/principles/code-quality.md` の6軸と設計原則を参照する

## Current Task

<!-- 毎セッション開始時に更新する。.claude/project-context.md の「現在のタスク」も同じ内容に合わせて更新する -->
**Taking on**: [取り組んでいる機能]
**Done**: [完了部分]
**Next**: [次にやること]

## Session Protocol

**セッション開始時**：人間が `.claude/handoff-artifact.md` をAIに渡して前のセッションの文脈を復元する。
その後、Current Task と `.claude/project-context.md` の「現在のタスク」を現在の状態に更新する。

**セッション終了時**：`Stop` イベントのHook（`.claude/hooks/post-session.sh`）が自動で `.claude/handoff-artifact.md` を生成する。
Hookを設定していない場合はAIに「handoff-artifact.mdを更新して」と依頼する。

## Report Format

実装完了時は必ず以下の形式で報告し、`@code-reviewer` を呼び出す：
```
変更ファイル：[パス] - [概要]
テスト結果：[通過N件 / 失敗N件]
層のルール：[問題なし / 問題あり（詳細）]
懸念点：[あれば記載。なければ「なし」]
要記録判断：[今回の実装でライブラリ選定・データモデル・認証方式・外部サービス契約・方針変更があったか。
            あれば decisions/ への記録を提案する。なければ「なし」]
```

<!-- decisions/ テンプレート：[DEV_STANDARDS_PATH]/snippets/tech-decision.md.template -->
<!-- 保存先：decisions/[連番]-[内容を表すslug].md -->

## Phase Transition

以下を聞いたとき、本番移行の検討を提案する：
「本番に出したい」「公開したい」「ユーザーに使ってもらいたい」
→ プロジェクトルートで以下を実行してAGENTS.mdを本番フェーズ用に切り替えることを提案する：
```
DEV_STANDARDS_PATH=[dev-standardsのパス] bash [dev-standardsのパス]/setup-harness.sh production
```
実行後、AGENTS.md・ARCHITECTURE.md の内容を本番フェーズ用に記入し直す。
