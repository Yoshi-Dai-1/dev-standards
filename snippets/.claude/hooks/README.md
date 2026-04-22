# Hooks

AIエージェントの行動に「コードによるガードレール」を設ける仕組み。

AGENTS.mdへの言語指示と異なり、Hooksはエージェントの意思に関わらず自動実行される。
「AIが忘れることへの対策」として機能する。

---

## AGENTS.mdとHooksの違い

```
AGENTS.md：言語による指示（エージェントが従う前提）
           → エージェントが忘れる可能性がある

Hooks：コードによる強制実行
       → エージェントの意思に関わらず必ず動く
```

---

## ツール対応状況

| ツール | Hooks対応 |
|--------|----------|
| Claude Code | ✅ `.claude/hooks/` |
| Gemini CLI | ✅ Hooks機能あり |
| GitHub Copilot | ⚠️ 部分的 |
| Cursor | ❌ 未対応（2026年4月時点） |

**使用するツールのドキュメントで対応状況を確認してから実装する。**

---

## このディレクトリのファイル

```
hooks/
  README.md                    ← このファイル
  post-skill-run.sh.example    ← スキル実行後の使用履歴記録
  pre-commit.sh.example        ← コミット前のセキュリティチェック
  post-file-edit.sh.example    ← ファイル編集後のlint・型チェック
  post-session.sh.example      ← セッション終了時のhandoff生成
```

`.example` 拡張子を外してプロジェクト固有の設定に書き換えて使う。

---

## 発火タイミング（Claude Codeの場合）

```
PreToolUse   → ツール実行前
PostToolUse  → ツール実行後  ← 使用履歴記録に使う
Stop         → セッション終了 ← handoff生成に使う
Notification → 通知時
```
