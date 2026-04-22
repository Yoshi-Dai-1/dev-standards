# AGENTS.md（運用フェーズ）

<!-- 推奨行数：60〜100行 -->
<!-- このフェーズでは「壊さないこと」が最優先 -->

## Project Overview

[プロジェクト名]：[技術スタックと目的]
Phase: Production Operation

## Commands

- Install: `pnpm install`
- Build: `pnpm build`
- Type check: `pnpm typecheck`
- Test: `pnpm test`
- Deploy: [デプロイコマンド]

## Architecture

詳細は `ARCHITECTURE.md` を参照。

## This Phase Priority

```
1. 既存機能を壊さない（リグレッションを防ぐ）
2. セキュリティ問題は最優先で対応
3. バグ修正 > パフォーマンス改善 > 新機能追加
4. 変更は小さく・確認可能な単位で行う
```

## Pre-Change Checklist

コードを変更する前に必ず確認する：
- この変更は既存のテストを壊すか → テストを実行して確認
- 影響範囲はどこか → 依存ファイルを列挙
- ロールバック手順はあるか → git revertで戻せる状態か

影響範囲が大きい場合は実施前に人間に確認を求める。

## Boundaries

- テストが通らない変更を本番に適用しない
- ロールバック手順なしで本番DBのデータを変更しない
- セキュリティ問題を後回しにしない
- 1コミットに複数の目的の変更を混ぜない

## Periodic Diagnosis（セッション開始時に自律実行）

以下を確認し、該当があれば人間に報告する：

**DDD診断**：services/・features/のビジネスロジックを読んで、
同じバリデーションの重複・ルールの意図の不明確化・変更波及の拡大が起きていないか確認する。
→ 詳細はdev-standardsの `principles/production-deployment.md` のDDDセクション参照
（セッション開始時にパスをAIに伝えるか、ファイルを直接渡す）。

**スキル化候補**：同じ種類の作業が3回以上来た場合、
dev-standardsの `decisions/skill-candidates.md` に記録して報告する
（セッション開始時にパスをAIに伝えるか、ファイルを直接渡す）。

## TDD for Bug Fixes

1. バグを再現するテストを先に書く
2. テストが失敗することを確認する
3. バグを修正する
4. テストが通ることを確認する
5. 既存のすべてのテストが通ることを確認する

## Current Task

**Handling**: [対応中の課題]
**Pending**: [保留中の機能要求]

## Report Format

```
変更内容：[概要]
変更ファイル：[パス] - [概要]
テスト：既存[通過N件] 新規[通過N件]
影響範囲：[変更が影響するコンポーネント]
ロールバック：git revert [コミットID]
懸念点：[あれば記載]
```
