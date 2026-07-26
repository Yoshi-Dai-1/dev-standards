---
name: find-skills
description: |
  Helps users discover and install agent skills when they ask questions
  like "how do I do X", "find a skill for X", "is there a skill that
  can...", or express interest in extending capabilities. This skill
  should be used when the user is looking for functionality that might
  exist as an installable skill.
license: MIT
compatibility: Designed for OpenCode (and similar agent products that support Agent Skills)
metadata:
  status: not-installed
  expansion-level: auto / confirm / none
---

## Purpose

外部スキルの検索・インストール。以下の Trigger Conditions に合致したとき、
`project-context.md` の「設定ファイルの自動展開レベル」に従ってインストールする。

## Trigger Conditions（客観的・検証可能）

以下のいずれかに該当する場合、条件成立と判定する。
「LLMの知識が不十分かどうか」のような主観的判断は行わない。

1. **外部サービス連携**: ユーザーが特定の外部サービス・API・プラットフォーム
   （例：「Stripe」「Supabase」「Firebase」「LINE Messaging API」）を名指しし、
   その連携実装について質問または依頼してきた
2. **ツール名の明示**: ユーザーが特定のツール・ライブラリ名を挙げて
   「これを使いたい」「これのやり方を知りたい」と依頼してきた
3. **プロジェクト定義の参照**: `docs/project-definition.md` や
   `ARCHITECTURE.md` に記載された外部サービス連携の実装を依頼された
4. **明示的な検索依頼**: ユーザーが「調べて」「検索して」「探して」
   「どんな選択肢があるか」と外部情報の探索を要求した

## Install Protocol

`.opencode/project-context.md` の「設定ファイルの自動展開レベル」を確認し、
以下の3段階で挙動を変える：

| 設定値 | AIの挙動 |
|--------|---------|
| `自動展開` | 確認なしで `_install.sh` を実行 → 完了後スキルを呼び出す |
| `確認付き展開` | 「find-skills をインストールしますか？」と人間に確認 → 承認後 `_install.sh` を実行 |
| `展開なし` | 「find-skills というスキルがあります。インストールしますか？」と提案する。実行は人間の判断に委ねる |
| 未設定（初回） | 上記3択を人間に提示し、選んでもらってから実行する |

インストール失敗時は「ネットワーク環境を確認してください」と伝える。
インストール成功後、本物の find-skills スキルを呼び出して目的の処理を続行する。
