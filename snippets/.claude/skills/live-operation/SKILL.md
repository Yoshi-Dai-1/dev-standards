---
name: live-operation
description: |
  本番環境が稼働中の状態でコードを変更するとき（バグ修正・機能追加・設定変更を問わない）。
  「本番で動いている」「ユーザーが使っている」状態での作業すべてに適用する。
  月次メンテナンスを依頼されたとき（「月次診断して」「月次チェックして」）にも参照する。
  優先順位：既存機能を壊さない > セキュリティ > バグ修正 > 改善 > 新機能追加
version: 1.0.0
last_used: YYYY-MM-DD
use_count: 0
status: active
---

## Pre-Change Checklist（変更前に必ず実行）

以下を確認してから変更に進む。確認せずに変更しない。

- [ ] この変更は既存のテストを壊すか → `pnpm test` を実行して確認
- [ ] 影響範囲はどこか → 依存ファイルを列挙する
      （広い場合は `@codebase-investigator` を呼び出す）
- [ ] ロールバック手順はあるか → git revertで戻せる状態か確認

影響範囲が大きい場合は実施前に人間に確認を求める。

## Periodic Diagnosis（条件付き実行）

このSkillが参照されたセッションで、以下のいずれかに該当するときのみ実行する。
該当しない場合はスキップして Pre-Change Checklist に進む。

- `.claude/handoff-artifact.md` のタイムスタンプが7日以上前（または存在しない）
- handoff-artifactの「未解決の問題」にバグ修正・インシデント対応の記録がある
- 人間から「診断して」と明示的に依頼された

該当した場合に確認する内容：

**DDD診断**：services/・features/のビジネスロジックを読んで以下を確認する：
- 同じバリデーション・ビジネスルールが複数箇所に重複していないか
- 1つの条件を変えると複数ファイルの修正が必要になっていないか
→ `[DEV_STANDARDS_PATH]/principles/production-deployment.md` のDDDセクション参照

**スキル化候補**：このセッション中に同じ種類の作業が3回以上発生した場合、
`decisions/skill-candidates.md` に記録して人間に報告する。

## Monthly Checklist（月次・「月次診断して」と依頼されたときのみ実行）

以下のサブエージェントを順番に呼び出す：
```
@resilience-checker
@code-quality-auditor
```

商用プロジェクトの場合は追加で：
`[DEV_STANDARDS_PATH]/principles/commercial-operations.md` の月次確認項目を実施する。

メインエージェントが直接実行する（毎月）：
```
decisions/ の各ファイルを読んで以下を確認する：
1. 判断の前提（使用技術・外部API・チーム構成）が変わっているものがないか
2. 「要確認」「未定」のまま放置されているものがないか
3. 1年以上前のADRで現在の実装と矛盾しているものがないか
問題があれば decisions/[連番]-review-YYYY-MM.md として記録する。
```

診断完了後の報告：
- 総合評価（GREEN/YELLOW/RED）
- 今月中に対処すべき最優先アクション
- decisions/ の要対応項目
- .claude/usage/ のGCが必要なものがあれば合わせて提案する
