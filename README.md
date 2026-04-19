# dev-standards

あらゆるプロジェクト種別に横断的に適用できる、アーキテクチャ設計のナレッジベース。
設計思想・命名規則・アーキテクチャパターンの判断基準を集積し、AIとともに開発するための文脈ファイルとして機能する。

## このリポジトリの目的

- **思想の記録**：なぜその構成を選んだかの判断根拠を残す
- **再利用**：新プロジェクト開始時の設計コストをゼロに近づける
- **AI協働**：AIへの指示時に「このドキュメントに従って」と渡す文脈ファイルとして使う

## 構成

```
dev-standards/
  principles/          汎用原則（プロジェクト種別を問わず適用）
    directory-structure.md          ディレクトリ設計の根本思想・判断フローチャート
    naming-conventions.md           ケーススタイル・ファイル名・変数名の規則
    file-size-and-cohesion.md       行数指針・凝集度・循環依存・バレルexport
    ssot-and-constants.md           型定義・定数・環境変数のSSOT管理
    non-functional-requirements.md  性能・可用性・セキュリティ・コストの定義

  architectures/       プロジェクト種別ごとのディレクトリ構成パターン
    web-frontend-large.md     FSD（機能が多いWebアプリ）
    web-frontend-small.md     シンプル構成＋FSDへの移行タイミング
    backend-api.md            レイヤードアーキテクチャ
    monorepo.md               pnpm workspaces + Turborepo
    data-pipeline.md          Python中心のデータ処理・スクリプト集
    document-project.md       教材・ドキュメント（ナンバリング例外ルール含む）
    production-readiness.md   本番リリース前チェックリスト

  decisions/           ADR（Architecture Decision Records）：判断の記録
    001-no-numbering-in-src.md
    002-kebab-case-for-dirs.md
    003-three-layer-knowledge-management.md

  snippets/            コピペ用設定ファイル・テンプレート
    ARCHITECTURE.md.template          各プロジェクトのARCHITECTURE.md雛形
    tech-decision.md.template         技術選定の記録テンプレート
    .gitignore.template
    .env.example.template
    tsconfig.base.json
    .claude/
      project-context.md.template     AIへの指示用コンテキストファイル雛形
      coding-conventions.md.template  AIへのコーディング規約ファイル雛形
```

## 使い方

### 新プロジェクト開始時

1. `architectures/` から最も近いパターンを選ぶ
2. `snippets/ARCHITECTURE.md.template` をプロジェクトルートにコピーして記入する
3. `snippets/.claude/project-context.md.template` を `.claude/project-context.md` としてコピーして記入する
4. `snippets/.claude/coding-conventions.md.template` を `.claude/coding-conventions.md` としてコピーする
5. 技術選定の根拠を `snippets/tech-decision.md.template` を使って `decisions/` に記録する
6. 開発中に生じた設計判断を `decisions/` にADRとして追記する

### 本番リリース前

`architectures/production-readiness.md` のチェックリストを確認する。

### AI（Claude等）への指示時

```
以下のドキュメントに従ってコードを書いてください：
- .claude/project-context.md      （プロジェクト概要・現在のタスク）
- ARCHITECTURE.md                  （設計思想・層のルール・非機能要件）
- .claude/coding-conventions.md   （コーディング規約）
```

`principles/` の各ファイルは設計判断の根拠として参照する。
AIへの指示には上記3ファイルで十分。

## 更新ルール

- `principles/` の原則は普遍的なため、変更する場合は理由をADRに記録する
- `architectures/` はプロジェクト経験に基づいて随時更新する
- `decisions/` は削除しない。判断を覆したときも「覆した理由」を追記して残す
- `snippets/` の設定ファイルは実際のプロジェクトで動作確認したものだけを入れる
