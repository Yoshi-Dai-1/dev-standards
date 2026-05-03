---
name: project-transition
description: |
  プロジェクトの重要な転換点で引き継ぎ手順を踏むためのSkill。
  以下の発言を検知したとき自動で参照する：
  「本番に出した」「リリースできた」「公開できた」
  「長期間開発を止める」「別の人に引き継ぐ」「しばらく触らない」
  「再開したい」（長期停止後の再開時）
version: 1.0.0
last_used: YYYY-MM-DD
use_count: 0
status: active
---

## Workflow

1. **現在の状態を保存する**
   `handoff-artifact.md` を現在の状態に更新する。以下を必ず含める：
   - 完了していること・未完了のこと
   - 重要な判断とその理由
   - 次に取り組むべきこと
   - 未解決の問題・懸念点

2. **人間に確認する**

   ```
   現在の状態を保存しました：
     Taking on: [内容]
     Done: [内容]
     Next: [内容]

   引き継ぎ・再開の準備が整っています。
   次のセッションでは .claude/handoff-artifact.md を最初に渡してください。
   ```

3. **Current Taskを更新する**
   転換後の最初のタスクをAGENTS.mdのCurrent Taskに記録する。

## Output Format

```
## 引き継ぎレポート [YYYY-MM-DD]

### 保存した状態
Taking on: [内容]
Done: [内容]
Next: [内容]

### 未解決の問題
[あれば記載。なければ「なし」]

### 次のセッションで最初にやること
[具体的な1つのタスク]
```
