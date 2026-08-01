# Session Context

## ステージ済みの変更
- `opencode/snippets/.opencode/instructions/requirements-change.md`: Full/Light Flow を h2 同列化、波及チェックを決定論化、「迷いやすいケースの補足」参照を明記
- `opencode/snippets/ARCHITECTURE.md.template`: HTMLコメントの「自動で」修正、完了時クリーンアップを全HTMLコメント削除に統合、Step 2 に補足追記、可視プレースホルダー5箇所を stack-setup.md ルール参照に修正
- `opencode/snippets/agents/AGENTS.md`: 0-f Step2 にHTMLコメント残存チェックを追加（docs/project-definition.md / ARCHITECTURE.md に限定）
- `opencode/snippets/DESIGN.md.template`: 永続注釈を【...】可視テキスト化、冗長な配置指示を削除、HTMLコメント0件
- `opencode/principles/project-definition-guide.md`: 保存時の注意（HTMLコメント全削除指示）を追加、末尾「セッション開始時の一文」を削除
- `opencode/snippets/.opencode/instructions/_fill-guide.md`: L10 の「write_file で」を削除、コメントの性質を「初回セットアップの記入プロセス中に AI が参照する指示で、記入完了時（0-f）にセクションごと削除」に更新
- `opencode/decisions/004-html-comment-handling.md`: 適用履歴に 2026-08-02 の変更を追記

## 未解決の課題
- （なし）

## 次のセッションでやること
- ステージ済み変更のコミット可否を人間に確認する（commit/push は人間の指示があるまで実行しない）
