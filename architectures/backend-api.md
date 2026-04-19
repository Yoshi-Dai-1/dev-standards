# アーキテクチャ：バックエンドAPI（レイヤードアーキテクチャ）

**向いている場面**：REST API・GraphQL API・CRUD中心のサービス
**採用パターン**：レイヤードアーキテクチャ（Layered Architecture）

---

## ディレクトリ構成

```
src/
  api/                    HTTPの関心（ルーター・コントローラー）
    routes/
      stock.routes.ts
      auth.routes.ts
    controllers/
      stock.controller.ts
      auth.controller.ts
    middleware/
      auth.middleware.ts
      error.middleware.ts
      validation.middleware.ts

  services/               ビジネスロジック（純粋な処理・DBを直接触らない）
    stock.service.ts
    auth.service.ts
    screening.service.ts

  repositories/           データアクセス（DB・外部APIの抽象化）
    stock.repository.ts
    user.repository.ts

  domain/                 ビジネスエンティティ・ルール（外部依存ゼロ）
    stock/
      stock.types.ts
      stock.constants.ts
      stock.validators.ts

  infra/                  外部依存の実装（DB接続・外部クライアント）
    database/
      db.client.ts
      migrations/
    external/
      edinet.client.ts
      alphavantage.client.ts

  shared/                 横断的関心事
    errors/
      AppError.ts
      HttpError.ts
    logger/
      logger.ts
    utils/
      formatNumber.ts
      formatDate.ts
    types/
      api.types.ts         APIレスポンスの共通型
      pagination.types.ts

  config/                 設定の読み込み・バリデーション
    env.ts                 環境変数を型安全に読み込む
    app.config.ts
```

---

## 依存ルール（厳守）

```
api → services → repositories → domain
            ↓
          infra（repositoriesから呼ぶ）

shared はどの層からも参照可能
domain は外部依存ゼロ（DBライブラリすら import しない）
services は DB・HTTPクライアントを直接触らない（repositories・infra経由）
```

---

## 各層の責務

| 層 | 責務 | 禁止事項 |
|----|------|---------|
| `api/` | リクエスト受信・レスポンス返却・認証チェック | ビジネスロジックを書かない |
| `services/` | ビジネスルールの実装 | DBを直接触らない・HTTPを知らない |
| `repositories/` | データの永続化・取得 | ビジネスロジックを書かない |
| `domain/` | エンティティの型・バリデーション | 外部ライブラリをimportしない |
| `infra/` | DB接続・外部API実装 | ビジネスロジックを書かない |

---

## エラーハンドリングの標準化

```typescript
// shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
  }
}

// 使用例（services/）
throw new AppError('STOCK_NOT_FOUND', '銘柄が見つかりません', 404);
```

---

## 環境変数の型安全な管理

```typescript
// config/env.ts
// 起動時に環境変数を検証・型付けする
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env);
// 以降は env.DATABASE_URL のように型安全にアクセス
```

---

## テスト構成

```
tests/
  unit/
    services/
      stock.service.test.ts    モックを使ったビジネスロジックの単体テスト
    utils/
      formatNumber.test.ts
  integration/
    api/
      stock.api.test.ts        実際のDBを使ったAPIテスト（テスト用DB）
  fixtures/                    テストデータ
    stock.fixture.ts
```
