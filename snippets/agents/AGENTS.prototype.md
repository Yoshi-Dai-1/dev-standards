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

詳細はdev-standardsの `principles/tdd-with-ai.md` を参照。
実装完了後の確認順序（tsc → ESLint → テスト → @code-reviewer → 人間レビュー）も同ファイルに定義。

## Security & Quality

<!-- 実装中の参照（原則の確認） -->
認証・機密データ・入力バリデーションを実装するとき：
→ `principles/security-implementation.md` の実装テンプレートを使う

優先度・投資水準の判断に迷ったとき：
→ `principles/risk-based-approach.md` のリスク4象限で判断する

実装中に「良いコードとは何か」を確認したいとき：
→ `principles/code-quality.md` の6軸と設計原則を参照する

<!-- 実装後の診断（サブエージェントに委任） -->
実装完了後：`@security-auditor` でセキュリティ監査
「最近コードが複雑になってきた」と感じたとき：`@code-quality-auditor` で品質診断

## Current Task

<!-- 毎セッションで更新する唯一の動的セクション -->
**Taking on**: [取り組んでいる機能]
**Done**: [完了部分]
**Next**: [次にやること]

## Report Format

実装完了時は必ず以下の形式で報告する：
```
変更ファイル：[パス] - [概要]
テスト結果：[通過N件 / 失敗N件]
層のルール：[問題なし / 問題あり（詳細）]
懸念点：[あれば記載。なければ「なし」]
要記録判断：[今回の実装でライブラリ選定・データモデル・認証方式・外部サービス契約・方針変更があったか。
            あれば decisions/ への記録を提案する。なければ「なし」]
```

<!-- decisions/ テンプレート：dev-standards/snippets/tech-decision.md.template -->
<!-- 保存先：decisions/[連番]-[内容を表すslug].md -->

## Phase Transition

以下を聞いたとき、本番移行の検討を提案する：
「本番に出したい」「公開したい」「ユーザーに使ってもらいたい」
→ dev-standardsの `snippets/agents/AGENTS.production.md` の内容でAGENTS.mdを上書きすることを提案する。
