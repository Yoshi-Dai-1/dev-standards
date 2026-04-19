# 命名規則

---

## ケーススタイル一覧

| スタイル | 書き方 | 主な用途 |
|---------|--------|---------|
| `kebab-case` | `stock-detail` | ディレクトリ名・URLパス・CSSクラス・HTMLカスタム属性 |
| `camelCase` | `stockDetail` | JS/TS変数・関数名・オブジェクトキー |
| `PascalCase` | `StockDetail` | クラス名・Reactコンポーネント名・型名・インターフェース名 |
| `snake_case` | `stock_detail` | Python変数・DB列名・SQLカラム |
| `UPPER_SNAKE_CASE` | `STOCK_DETAIL` | 定数・環境変数名 |

---

## ディレクトリ名

**kebab-case を使う**

```
features/stock-detail/
features/user-auth/
shared/form-components/
```

理由：
- 大文字小文字を区別しないOS（macOS）と区別するOS（Linux）の両方で安全
- URLパスと対称性がある
- スペースを含まないため `cd` コマンドや `import` パスで引用符不要

---

## ファイル名

| 対象 | 規則 | 例 |
|------|------|----|
| Reactコンポーネント | `PascalCase.tsx` | `StockCard.tsx` |
| カスタムhooks | `camelCase.ts`（`use` prefix必須） | `useStockData.ts` |
| ユーティリティ関数 | `camelCase.ts` | `formatNumber.ts` |
| サービス | `camelCase.ts`（`Service` suffix推奨） | `stockService.ts` |
| リポジトリ | `camelCase.ts`（`Repository` suffix推奨） | `stockRepository.ts` |
| 型定義ファイル | `*.types.ts` | `stock.types.ts` |
| 定数ファイル | `*.constants.ts` | `api.constants.ts` |
| テストファイル | `*.test.ts` / `*.spec.ts` | `useStockData.test.ts` |
| 設定ファイル | ツールの規約に従う | `jest.config.ts` |
| スタイル（CSS Modules） | `*.module.css` | `stockCard.module.css` |

---

## 命名の意図を伝えるパターン

ファイル名・変数名・関数名は「ドメイン + 種別」の構造で命名する。
名前を見ただけで「何のドメインの・何をするものか」が分かることが目標。

```
useStockScreener.ts   "use" → フック  "Stock" → ドメイン  "Screener" → 機能
StockCard.tsx         "Stock" → ドメイン  "Card" → UIパターン
stockRepository.ts    "stock" → ドメイン  "Repository" → 層（データアクセス）
formatCurrency.ts     動詞始まり → 純粋関数
STOCK_LIMITS.ts       UPPER_SNAKE → 定数（グローバルに不変）
```

---

## 変数・関数名の規則

### 関数名は動詞始まり

```typescript
// 良い
getUserById()
formatCurrency()
validateStockCode()
fetchEarnings()
calculateROE()

// 悪い
userById()         // 何をする関数か分からない
currency()         // 名詞だけ
```

### Boolean変数・プロパティは `is` / `has` / `can` で始める

```typescript
const isLoading = true;
const hasError = false;
const canSubmit = true;

// 悪い
const loading = true;
const error = false;
```

### 配列・コレクションは複数形

```typescript
const stocks = [];
const userIds = [];

// 悪い
const stock = [];   // 単数形だと1件に見える
```

### イベントハンドラは `handle` または `on` prefix

```typescript
const handleSubmit = () => { ... };
const onClose = () => { ... };

// propsとして渡すときは on prefix
<Modal onClose={handleClose} />
```

---

## 型名・インターフェース名

```typescript
// 型名はPascalCase、意味のある名前
type StockSummary = { ... };
type ApiResponse<T> = { ... };

// インターフェースは I prefix を使わない（現代的な慣習）
interface StockRepository { ... }  // 良い
interface IStockRepository { ... } // 古い慣習・使わない

// ユーティリティ型は意図が明確な名前
type Nullable<T> = T | null;
type AsyncResult<T> = Promise<{ data: T; error: string | null }>;
```

---

## 定数名

```typescript
// グローバル定数：UPPER_SNAKE_CASE
const API_BASE_URL = 'https://...';
const MAX_RETRY_COUNT = 3;

// ローカル定数（関数内）：camelCase でも可
const maxRetries = 3;

// オブジェクト定数：PascalCase
const HttpStatus = {
  OK: 200,
  NOT_FOUND: 404,
} as const;
```

---

## gitブランチ名

```
main              本番ブランチ
develop           開発統合ブランチ

feature/stock-screener     機能追加
fix/login-error            バグ修正
refactor/auth-layer        リファクタリング
docs/add-architecture-md   ドキュメント
chore/update-dependencies  依存関係更新
```

---

## コミットメッセージ（Conventional Commits）

```
feat: 株式スクリーナーの条件保存機能を追加
fix: ログイン時のトークンリフレッシュエラーを修正
refactor: 認証レイヤーをrepositoriesパターンに移行
docs: ARCHITECTURE.mdにFSD層のルールを追記
chore: ESLintをv9に更新
test: useStockDataのユニットテストを追加
```

---

## 禁止パターン

```
# ファイル名
image1.png          → hero-banner.png
最終版.md           → v2-proposal.md（日本語ファイル名は避ける）
new_component2.tsx  → 何の意味もない連番

# 変数名
data                → stockData, apiResponse など具体的に
info                → userInfo → user で十分
temp                → 何がtempなのかを書く
x, y, i            → ループ変数以外では使わない

# 関数名
doStuff()           → 何をするか明示する
process()           → 何を処理するか明示する
handleEverything()  → 単一責任に分割する
```
