# AGENTS.md

<!-- 推奨行数：60〜100行 -->
<!-- このファイルはAIエージェントが自動で読み込む「作業指示書」 -->
<!-- 詳細ドキュメントへの参照を書く。詳細をここに書かない（段階的開示） -->

## Project Overview

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

1. 人間がテストケースを日本語で定義する
2. テストコードに変換する（実装は書かない）
3. 人間がテストの内容を日本語で確認する
4. テストを通す実装を書く
5. テストを実行して結果を報告する
6. 失敗した場合は原因を説明して修正しStep5に戻る

詳細は `dev-standards/principles/tdd-with-ai.md` を参照。

## Current Task

<!-- 毎セッションで更新する唯一の動的セクション -->
**Taking on**: [取り組んでいる機能]
**Done**: [完了部分]
**Next**: [次にやること]

## Report Format

実装完了時は以下の形式で報告する：
```
変更ファイル：[パス] - [概要]
テスト結果：[通過N件 / 失敗N件]
層のルール：[問題なし / 問題あり（詳細）]
懸念点：[あれば記載。なければ「なし」]
```

## Phase Transition

以下を聞いたとき、本番移行の検討を提案する：
「本番に出したい」「公開したい」「ユーザーに使ってもらいたい」
→ AGENTS.md を `dev-standards/snippets/agents/AGENTS.production.md` に切り替えることを提案する
