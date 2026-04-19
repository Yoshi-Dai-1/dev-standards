# ディレクトリ構成の原則

あらゆるプロジェクト種別に適用する普遍的な原則。
種別ごとの具体的な構成は `architectures/` を参照。

---

## 根本思想

ディレクトリ構成は「コードの住所録」ではなく「設計思想の可視化」である。
初めてリポジトリを見た人間・AIが、構成を眺めるだけで以下を理解できる状態を目指す：

- このプロジェクトは何をするものか
- どこに何を書くべきか
- 何が何に依存してよいか

---

## 普遍的ルール

### 1. 関心の分離を物理的に表現する

論理的に分離すべきものは、ディレクトリレベルで分離する。
「同じファイルに書ける」と「同じファイルに書くべき」は別の話。

```
# 良い例：関心が分離されている
src/
  features/     ビジネスロジック
  shared/       横断的な共通部品
  infra/        外部依存（API・DB）

# 悪い例：何でも入れる utils/ の肥大化
src/
  utils/        API呼び出し・日付処理・型変換・定数・... 何でも入っている
```

### 2. 凝集度：一緒に変わるものは一緒に置く

ある機能を削除するとき、関連ファイルが複数ディレクトリに散らばっていると取り残しが起きる。
関連するファイルは同じディレクトリに置く（コロケーション）。

```
# 良い：StockCardに関するものが一箇所にある
features/stock-card/
  StockCard.tsx
  useStockCard.ts
  stockCard.types.ts
  stockCard.module.css
  index.ts

# 悪い：削除時に4箇所を探す必要がある
components/StockCard.tsx
hooks/useStockCard.ts
types/stockCard.types.ts
styles/stockCard.module.css
```

### 3. 依存の方向を一方向に保つ

循環依存は設計の崩壊を示すサイン。依存は常に一方向。

```
# フロントエンドの場合（上から下への依存のみ許可）
pages → features → entities → shared

# バックエンドの場合
api → services → repositories → domain

# 禁止：shared が features に依存する
# 禁止：A → B → A の循環
```

### 4. ルートディレクトリは地図として機能させる

ルートを見た人が30秒でプロジェクト全体を把握できること。

```
project-root/
  src/              アプリケーションコード（唯一の聖域）
  tests/            テスト（srcと鏡像構造にする）
  docs/             ドキュメント
  scripts/          ビルド・デプロイ・開発補助スクリプト
  config/           自作設定ファイル（ツール規約でルート必須のものは除く）
  .github/          CI/CD設定
  .env.example      必要な環境変数のテンプレート（コミットする）
  ARCHITECTURE.md   このプロジェクトの設計思想・層のルール
  README.md         概要・セットアップ手順
```

### 5. 深さは3〜4階層に抑える

```
# 良い（4階層）
src/features/auth/hooks/useLogin.ts

# 悪い（7階層・探索不可能）
src/modules/core/features/auth/v2/hooks/custom/useLogin.ts
```

### 6. フォルダ名の先頭ナンバリングはプロダクションコードに使わない

ナンバリングはgit差分の汚染・importパスの破壊・AIのパス誤認識を招く。
有効な場面はドキュメント・チュートリアルなど「読む順序が意味を持つコンテンツ」に限定する。

```
# 禁止：プロダクションコード
src/
  01_auth/
  02_stock/
  03_screening/

# 許可：教材・ドキュメント
docs/
  01_getting-started/
  02_architecture/
  03_api-reference/
```

---

## ファイルサイズの指針

| 種別 | 目安 | 超えたときのアクション |
|------|------|----------------------|
| 通常のソースファイル | 200〜300行 | 責務を分割する |
| テストファイル | 上限なし（対象の2〜3倍になることがある） | 分割不要 |
| 自動生成ファイル | 上限なし | 手動管理しない |

300行を超えてきたとき、それはたいてい「複数のことをやっている」サイン。
行数は品質の指標ではなく、責務の過多を検知するセンサーとして使う。

AI協働においては200行以内が特に有効。AIへの修正指示が意図した範囲に限定されやすくなる。

---

## SSOTの適用

→ 詳細は `principles/ssot-and-constants.md` を参照。

型定義・APIエンドポイント・定数・マジックナンバーの管理方針はそちらに集約している。

---

## 環境変数ファイルの管理

```
.env                  gitにコミットしない（.gitignore必須）
.env.local            個人の上書き用
.env.development      開発環境用
.env.production       本番用（機密情報はCI/CDのシークレットで管理）
.env.example          必要な変数名だけ書いたテンプレート（コミットする・SSOTとして機能）
```

---

## テストディレクトリの配置

コロケーション型（推奨）とミラー型のどちらかに統一する。プロジェクト内で混在させない。

**コロケーション型**（推奨）

```
src/features/auth/
  useLogin.ts
  useLogin.test.ts   ← ソースの隣に置く
```

**ミラー型**

```
tests/
  features/
    auth/
      useLogin.test.ts
```

---

## 判断フローチャート（何かを決めるときの思考順序）

```
1. これはどのレイヤーに属するか？              → ARCHITECTURE.mdで確認
2. 一緒に変わるものは一緒に置かれているか？     → 凝集度の確認
3. 依存の方向は正しいか？                      → 循環依存の確認
4. 名前を見ただけで責務が分かるか？             → naming-conventions.md で確認
5. 1ファイルが200行を超えていないか？           → 分割を検討
6. 同じ情報が複数箇所にないか？                 → ssot-and-constants.md で確認
7. 非機能要件（性能・セキュリティ）を満たすか？ → non-functional-requirements.md で確認
```
