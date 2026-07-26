# コード品質ルール（Code Quality Rules）

このルールはコードファイル編集時に Plugin が注入する。

詳細な判断基準・実装手引は以下を参照（必要時に読む）：
- `.opencode/standards/principles/code-quality.md`（コード品質の6軸の定義とチェックリスト）
- `.opencode/standards/principles/cognitive-load-design.md`（認知負荷設計の統一枠組み）
- `.opencode/standards/principles/file-size-and-cohesion.md`（ファイル分割と凝集度の判断基準）

確認順序（型チェック → lint → テスト → @code-reviewer → 人間レビュー）は `.opencode/standards/principles/tdd-with-ai.md` の「TDDと他のツールの組み合わせ」セクションに定義。このファイルでは重複定義しない。コーディング規約（`.opencode/coding-conventions.md`）は未読の場合、先に読む。

---

## 自律トリガー（人間の指示を待たずに実行する）

### 新規ファイルを作成したとき

1. `.opencode/standards/principles/code-quality.md` を読み、コード品質の6軸（可読性・保守性・テスト可能性・複雑性・一貫性・依存関係の健全性）を満たしているか確認する
2. `.opencode/standards/principles/file-size-and-cohesion.md` を読み、ファイルサイズの閾値と凝集度基準を確認する
3. 閾値を超える場合は分割を提案する
4. 50行を超える新規関数・モジュールを含む場合、`.opencode/standards/principles/cognitive-load-design.md` の「設計時の認知境界セルフチェック」を確認する
5. 確認順序を実行する

### 既存ファイルを編集したとき

1. `.opencode/standards/principles/code-quality.md` を読み、編集後のコードが品質6軸（可読性・保守性・テスト可能性・複雑性・一貫性・依存関係の健全性）に沿っているか確認する
2. `.opencode/standards/principles/file-size-and-cohesion.md` を読み、編集後のファイルサイズが閾値を超えていないか確認する
3. 超過している場合は分割を提案する
4. 確認順序を実行する

### リファクタリングを行うとき

1. `.opencode/standards/principles/file-size-and-cohesion.md` を読み、凝集度基準に従って分割を提案する
2. 単一責任の原則に反するコードを特定し、解消する
3. 構造変更が発生する場合、`.opencode/standards/principles/cognitive-load-design.md` の「設計判断時の思考フロー」で認知境界を確認する
4. 確認順序を実行する

---

## 品質劣化のサイン

以下のサインを検出した場合、`.opencode/standards/principles/code-quality.md` を読んで対応する：
- 同一パターンのコードが3箇所以上に出現（DRY違反）
- 1ファイルが300行を超えている
- 関数の責務を20文字以内で説明できない
- テストがない・テストが通らない
- 循環依存が発生している

---

## 常駐禁止事項

- 300行を超えるファイルを分割せずに放置しない
- 複数の責務を持つ関数・クラスを作成しない
- コード品質の6軸のうち複数に違反する変更を一度に行わない
