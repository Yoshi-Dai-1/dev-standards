---
name: handoff
description: |
  This skill should be used when handing off work between sessions, pausing
  development long-term, or resuming after a break. Use this skill whenever
  the user says: 「本番に出した」「リリースできた」「公開できた」
  「長期間開発を止める」「別の人に引き継ぐ」「しばらく触らない」
  「再開したい」「続きをやりたい」「前回の続きから」
  Make sure to use this skill even when the user does not say "handoff"
  explicitly — any context reset, development pause, or session resumption
  qualifies. Do NOT use for release preparation (use release-prep instead).
version: 1.0.0
status: active
---

## When to Use

このスキルを使うべきタイミング：
- セッションをまたいで作業を引き継ぐとき
- 長期停止・別の人への引き継ぎ前
- 「再開したい」「前回の続きから」など、前セッションの文脈を復元するとき
- 本番リリース後（状態の記録として）

このスキルを使わないタイミング：
- 本番リリースの準備中（→ release-prep を使う）
- 単純な質問・調査タスク（状態保存が不要なとき）

## Workflow

1. **現在の状態を保存する**
   `.claude/handoff-artifact.md` を現在の状態に更新する。以下を必ず含める：
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
