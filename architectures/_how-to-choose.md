# アーキテクチャの選び方

`architectures/` にある6種別のパターンから、プロジェクトに合うものを1つ選ぶ。
迷ったら以下のフローで判断する。

---

## 選択フローチャート

```
Q1. 作るものは何か？
  ├── ブラウザで動くUI                          → Q2へ
  ├── HTTPで呼ぶAPI・サーバー                   → backend-api.md
  ├── データ収集・分析・バッチ処理スクリプト    → data-pipeline.md
  ├── 研修教材・技術ドキュメント・仕様書集      → document-project.md
  └── フロント・バックを1リポジトリで管理したい → monorepo.md

Q2. UIの規模は？（「ブラウザで動くUI」と回答した場合）
  ├── 機能が10以下・個人開発・短期プロジェクト → web-frontend-small.md
  └── 機能が多い・長期運用・チーム開発         → web-frontend-large.md
```

---

## 迷いやすいケースの補足

### 「web-frontend-small か large か分からない」

→ 最初は必ず `web-frontend-small.md` を選ぶ。

理由：小規模構成から始めて必要になったら移行する方が、最初からFSDを導入して
持て余すより低コスト。移行タイミングは `web-frontend-small.md` の
「FSDへの移行タイミング」セクションに明示されている。

### 「フロントとバックを両方作る」

型定義を共有したい（フロントとバックで同じ型を使いたい）→ `monorepo.md`
独立してデプロイする（型共有は不要）→ `web-frontend-*.md` と `backend-api.md` を別リポジトリで使う

### 「スクリプトを書くが、Webからも呼びたい」

→ `data-pipeline.md`（スクリプト部分）と `backend-api.md`（API部分）を組み合わせる。
何が主体かで、どちらを先に読むかを決める。

### 「複数の種別が混在する」

→ 主体となる種別のファイルを選び、ARCHITECTURE.mdの「参照ドキュメント」欄に
補助的に参照したファイルを記載する。完全に一致するパターンがなくても問題ない。
パターンは「出発点」であり「縛り」ではない。

---

## 選んだ後にやること

1. 該当の `architectures/*.md` を通読する
2. `snippets/ARCHITECTURE.md.template` をプロジェクトルートに `ARCHITECTURE.md` としてコピーする
3. 通読した内容をもとに `ARCHITECTURE.md` の各セクションを記入する
4. 記入した `ARCHITECTURE.md` を `AGENTS.md` の `## Architecture` セクションから参照させる

```
# AGENTS.md の Architecture セクションの書き方
## Architecture

詳細は `ARCHITECTURE.md` を参照。
採用パターン：[web-frontend-small / web-frontend-large / backend-api / ...]
依存の方向（変更禁止）：[層A] → [層B] → [層C]
```

---

## AIを使ってアーキテクチャを選ぶ

迷いが解消しない場合は、以下のプロンプトでAIに判断を委ねる。

```
docs/project-definition.md を読んだ上で、
dev-standards の architectures/_how-to-choose.md のフローチャートに従って
このプロジェクトに適したアーキテクチャパターンを1つ提案してください。

提案理由と、選ばなかったパターンの却下理由もあわせて教えてください。
```
