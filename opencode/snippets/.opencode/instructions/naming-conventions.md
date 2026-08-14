# 命名規則ルール（Naming Conventions Rules）

このルールはセッション開始時に常時読み込まれる。AI がファイル・フォルダ・関数・変数を命名する際の基底規則（コア表）と自律トリガーを定義する。

詳細な判断基準・フレームワーク固有の深掘りルールは `.opencode/standards/principles/naming-conventions.md` を参照（必要時に読む）。

---

## 優先チェーン

命名規則の適用は以下の順で決定する。

| 順 | 情報源 | 役割 |
|----|--------|------|
| 1 | `ARCHITECTURE.md`（常時読込）の「命名規則」セクション | プロジェクト固有の **SSOT**。確定値があれば最優先で従う |
| 2 | `.opencode/coding-conventions.md` | プロジェクト固有のコーディング規約 |
| 3 | 言語別・フレームワーク固有の強制ルール | 各言語の標準規約・Next.js / Django / Rails 等が強制する命名規則。**基本コア表より優先する**（確定手順は `.opencode/standards/principles/naming-conventions.md` の「命名規則の確定手順」セクション参照） |
| 4 | 本ファイルのコア表（下記） | 言語非依存の基底規則（デフォルト）。3 までで決まらない場合に適用 |

**基本コア表と言語別・フレームワーク固有ルールが矛盾する場合、後者を優先する。**
例：基本コア表は「ディレクトリ名は kebab-case」だが、Python プロジェクトでは snake_case が言語別ルールとして上書きする。

---

## コア表：ケーススタイル一覧

| スタイル | 書き方 | 主な用途 |
|---------|--------|---------|
| `kebab-case` | `stock-detail` | ディレクトリ名・URLパス・CSSクラス・HTMLカスタム属性 |
| `camelCase` | `stockDetail` | JS/TS変数・関数名・オブジェクトキー |
| `PascalCase` | `StockDetail` | クラス名・Reactコンポーネント名・型名・インターフェース名 |
| `snake_case` | `stock_detail` | Python変数・DB列名・SQLカラム |
| `UPPER_SNAKE_CASE` | `STOCK_DETAIL` | 定数・環境変数名 |

---

## コア表：ディレクトリ名

**JS/TS プロジェクト：kebab-case を使う**
**Python / Go / Rust プロジェクト：snake_case を使う（言語別ルールが上書きする）**

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

## コア表：ファイル名

| 対象 | 規則 | 例 |
|------|------|----|
| Reactコンポーネント | `PascalCase.tsx` | `StockCard.tsx` |
| カスタムhooks | `camelCase.ts`（`use` prefix必須） | `useStockData.ts` |
| ユーティリティ関数 | `camelCase.ts` | `formatNumber.ts` |
| サービス | `camelCase.ts`（`Service` suffix推奨） | `stockService.ts` |
| リポジトリ | `camelCase.ts`（`Repository` suffix推奨） | `stockRepository.ts` |
| 型定義ファイル | `*.types.ts` | `stock.types.ts` |
| 定数ファイル | `*.constants.ts` | `api.constants.ts` |
| テストファイル | 各言語の標準規約（下記「テストファイル命名規則」参照） | `useStockData.test.ts` |
| 設定ファイル | ツールの規約に従う | `jest.config.ts` |
| スタイル（CSS Modules） | `*.module.css` | `stockCard.module.css` |

---

## コア表：テストファイル命名規則

テストファイルは原則として各言語の標準規約に従う。`ARCHITECTURE.md`（常時読込）に確定値がある場合はそちらを優先する。

| 言語 | 標準パターン | 例 |
|------|-------------|----|
| JavaScript / TypeScript | `*.test.ts` / `*.spec.ts` | `useLogin.test.ts` |
| React (JSX/TSX) | `*.test.tsx` / `*.spec.tsx` | `HomeScreen.test.tsx` |
| Python | `test_*.py` / `*_test.py` / `*.test.py` | `test_auth.py` |
| Go | `*_test.go`（Goコンパイラが強制） | `handler_test.go` |
| Rust | `*_test.rs`（`tests/` ディレクトリも可） | `lib_test.rs` |
| Java | `*Test.java` / `*Tests.java` / `*Spec.java` | `UserServiceTest.java` |
| Kotlin | `*Test.kt` / `*Spec.kt` | `AuthSpec.kt` |
| C# | `*Tests.cs` / `*Test.cs` | `ShoppingCartTests.cs` |
| Ruby | `*_spec.rb`（RSpec） / `*_test.rb`（Minitest） | `user_spec.rb` |
| Swift | `*Tests.swift` | `LoginTests.swift` |
| C / C++ | `*_test.cpp` / `*_test.c` / `*Test.cpp` / `*Test.c` | `calculator_test.cpp` |
| PHP | `*Test.php` / `*Tests.php` | `PaymentGatewayTest.php` |

言語別表にない言語は、その言語の標準テスティングフレームワークの規約に従う。
テスト種別（ユニット / 結合 / E2E）の区別ルールは `.opencode/standards/principles/naming-conventions.md` の「テスト種別の命名規則」を参照。

---

## 自律トリガー（人間の指示を待たずに実行する）

### 新しいファイルを作成するとき

1. 本ファイルのコア表を確認し、ファイル名の命名規則を適用する
2. `ARCHITECTURE.md`（常時読込）の「命名規則」セクションに確定値がある場合はそちらを SSOT として従う
3. 拡張子に応じた言語別ルールを適用する
4. **テストファイルは各言語の標準規約（本ファイルの「テストファイル命名規則」参照）に従う。プロジェクト独自の規約がある場合は `ARCHITECTURE.md`（常時読込）を優先する**

### 新しい関数・変数・クラス・型を命名するとき

1. 本ファイルのコア表を確認し、使用言語の命名規則を適用する
2. 基本ルールと言語別ルールが矛盾する場合、言語別ルールを優先する
3. 既存コードベースの命名パターンと一貫性を保つ

### @code-reviewer が呼ばれたとき

1. `ARCHITECTURE.md`（常時読込）の「命名規則」と本ファイルのコア表を確認し、命名規則違反がないかチェックする
2. 詳細な判断基準が必要な場合は `.opencode/standards/principles/naming-conventions.md` を読む

---

## 常駐禁止事項

- `ARCHITECTURE.md`（常時読込）の「命名規則」に確定値がある場合、それを無視しない
- プロジェクトの言語別ルールと矛盾する命名を行わない
- 同一プロジェクト内でスタイルを混在させない（ファイル名は全ファイル統一）
