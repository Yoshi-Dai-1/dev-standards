# dev-standards

個人開発における設計思想・命名規則・アーキテクチャパターンのナレッジベース。
あらゆるプロジェクト種別に横断的に適用できる判断基準を集積する。

## このリポジトリの目的

- **思想の記録**：なぜその構成を選んだかの判断根拠を残す
- **再利用**：新プロジェクト開始時の設計コストをゼロに近づける
- **AI協働**：AIへの指示時に「このドキュメントに従って」と渡す文脈ファイルとして使う

## 構成

```
dev-standards/
  principles/          汎用原則（種別を問わず適用）
  architectures/       プロジェクト種別ごとのディレクトリ構成パターン
  decisions/           ADR（Architecture Decision Records）：判断の記録
  snippets/            コピペ用設定ファイル・テンプレート
```

## 使い方

### 新プロジェクト開始時

1. `architectures/` から最も近いパターンを選ぶ
2. `snippets/` から設定ファイルをコピーする
3. `snippets/.claude/project-context.md.template` を元に `.claude/project-context.md` を書く
4. 開発中に生じた設計判断を `decisions/` にADRとして追記する

### AI（Claude等）への指示時

```
以下のドキュメントに従ってコードを書いてください：
- principles/directory-structure.md
- principles/naming-conventions.md
- architectures/[該当するパターン].md
```

## 更新ルール

- 原則は変わらないが、`architectures/` はプロジェクト経験に基づいて随時更新する
- `decisions/` は削除しない。判断を覆したときも「覆した理由」を追記して残す
- `snippets/` の設定ファイルは実際のプロジェクトで動作確認したものだけを入れる
