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
以下の症状が現在のコードに存在するか確認する（前回との比較は不要）。
- 同じバリデーション・ビジネスルールが複数箇所に重複している
- ビジネスルールの意図がコードから読み取りにくくなっている
- 1つの条件を変えると複数ファイルの修正が必要になっている
→ 詳細は `[DEV_STANDARDS_PATH]/principles/production-deployment.md` のDDDセクション参照。

**スキル化候補**：このセッション中に同じ種類の作業が3回以上発生した場合、
`[DEV_STANDARDS_PATH]/decisions/skill-candidates.md` に記録して報告する。
（セッションをまたぐカウントはHooksで自動記録されている場合のみ参照する）

## Monthly Checklist（月次・明示的に依頼されたとき実行）

以下のサブエージェントを順番に呼び出す：

```
@resilience-checker
@code-quality-auditor
```

商用プロジェクトの場合は追加で：

```
principles/commercial-operations.md の月次確認項目を実施してください。
```

診断完了後、人間に報告する：
- 総合評価（GREEN/YELLOW/RED + GOOD/CAUTION/ATTENTION）
- 今月中に対処すべき最優先アクション
- .claude/usage/ のGCが必要なものがあれば合わせて提案する

## TDD for Bug Fixes

1. バグを再現するテストを先に書く
2. テストが失敗することを確認する
3. バグを修正する
4. テストが通ることを確認する
5. 既存のすべてのテストが通ることを確認する

## Current Task

**Handling**: [対応中の課題]
**Pending**: [保留中の機能要求]

## Session Protocol

**セッション開始時**：人間が `.claude/handoff-artifact.md` をAIに渡して前のセッションの文脈を復元する。
その後、Current Task と `.claude/project-context.md` の「現在のタスク」を現在の状態に更新する。

**セッション終了時**：`Stop` イベントのHook（`.claude/hooks/post-session.sh`）が自動で `.claude/handoff-artifact.md` を生成する。
Hookを設定していない場合はAIに「handoff-artifact.mdを更新して」と依頼する。

## Report Format

```
変更内容：[概要]
変更ファイル：[パス] - [概要]
テスト：既存[通過N件] 新規[通過N件]
影響範囲：[変更が影響するコンポーネント]
ロールバック：git revert [コミットID]
懸念点：[あれば記載]
```
