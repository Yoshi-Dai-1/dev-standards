# Hooks

AIエージェントの行動に「コードによるガードレール」を設ける仕組み。

AGENTS.mdへの言語指示と異なり、Hooksはエージェントの意思に関わらず自動実行される。
「AIが忘れることへの対策」として機能する。

---

## Claude Code Hooks と Git hooks の違い

```
Claude Code Hooks：Claude Codeのライフサイクルイベントに発火する
  設定場所：.claude/settings.json（プロジェクト）または ~/.claude/settings.json（グローバル）
  発火条件：Claude CodeがWrite・Edit・Bash等のツールを実行したとき
  対象：Claude Codeが行う操作のみ。人間が手動で実行した操作には発火しない。

Git hooks：gitコマンド実行時に発火する
  設定場所：.git/hooks/（gitignore対象・チームで共有されない）
  発火条件：git commit・git push等を実行したとき
  対象：Claude Codeと人間の両方のgit操作に発火する
```

このディレクトリのhookファイルはすべて **Claude Code Hooks** です。

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
| Claude Code | ✅ `.claude/settings.json` |
| Gemini CLI | ✅ Hooks機能あり |
| GitHub Copilot | ⚠️ 部分的 |
| Cursor | ❌ 未対応（2026年4月時点） |

**使用するツールのドキュメントで対応状況を確認してから実装する。**

---

## このディレクトリのファイル

ファイル名は `on-[イベント名].[目的].sh.example` の形式で統一している。
見た瞬間に「いつ発火するか」と「何をするか」が分かる。

```
hooks/
  README.md
  on-stop.generate-handoff.sh.example                       ← Stopイベント：handoff生成
  on-pre-tool-use.check-secrets.sh.example                  ← PreToolUseイベント：機密情報チェック
  on-post-tool-use.lint-and-typecheck.sh.example            ← PostToolUseイベント：lint・型チェック
  on-post-tool-use.record-skill-usage.sh.example            ← PostToolUseイベント：スキル使用履歴記録
  on-post-tool-use.architecture-skill-check.sh.example      ← PostToolUseイベント：外部スキル診断
```

`.example` 拡張子を外してプロジェクト固有の設定に書き換えて使う。

---

## 発火タイミング（Claude Codeの場合）

```
PreToolUse   → ツール実行前（ブロック可能）
PostToolUse  → ツール実行後（使用履歴記録・lint・型チェック）
Stop         → セッション終了（handoff生成）
Notification → 通知時
```

## matcherの書き方

```json
{ "matcher": "Write|Edit|MultiEdit" }   // ファイル編集ツール
{ "matcher": "Bash" }                   // Bashツール
{ "matcher": "Skill" }                  // スキル実行
```

matchers は大文字小文字を区別する。正確に記載すること。

## settings.json への登録方法

`.claude/settings.json` に以下の形式で記述する：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [{ "type": "command", "command": ".claude/hooks/on-post-tool-use.lint-and-typecheck.sh" }]
      },
      {
        "matcher": "Skill",
        "hooks": [{ "type": "command", "command": ".claude/hooks/on-post-tool-use.record-skill-usage.sh" }]
      },
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [{ "type": "command", "command": ".claude/hooks/on-post-tool-use.architecture-skill-check.sh" }]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": ".claude/hooks/on-pre-tool-use.check-secrets.sh" }]
      }
    ],
    "Stop": [
      {
        "hooks": [{ "type": "command", "command": ".claude/hooks/on-stop.generate-handoff.sh" }]
      }
    ]
  }
}
```
