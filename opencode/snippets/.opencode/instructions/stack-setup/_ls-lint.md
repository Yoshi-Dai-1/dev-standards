#### ファイル名規約の機械的強制（全言語対応）

ls-lint をプロジェクトに導入し、ファイル名・ディレクトリ名の命名規則を機械的に強制する。

**なぜ必要か**: AI エージェントの自律適用だけに頼ると、記憶の喪失や指示逸脱のリスクがある。ls-lint は pre-commit hook と CI で二重に保護する。

**インストール（`.opencode/project-context.md` の「設定ファイルの自動展開レベル」に応じて）:**
```
自動展開：  {pm} install --save-dev @ls-lint/ls-lint を実行する（確認なし）
確認付き展開：「ls-lint をインストールしますか？」と確認し、承認後に実行する
展開なし：  コマンドを提示するのみ（実行しない）
```

**.ls-lint.yml の生成・更新（SSOT: `.opencode/instructions/naming-conventions.md`）:**

命名規則の SSOT（Single Source of Truth）は `.opencode/instructions/naming-conventions.md` です。
`.ls-lint.yml` は `.opencode/instructions/naming-conventions.md` のルールを機械的に表現したものです。

1. `.opencode/instructions/naming-conventions.md` のルールに基づき、各ディレクトリ・ファイル種別の命名規則を確認する
2. `ARCHITECTURE.md` の「ディレクトリ構成」セクションの内容に基づき、プロジェクトの実際のディレクトリ構成を確認する
3. 上記2つの情報から `.ls-lint.yml` を生成・更新する

**`ARCHITECTURE.md` の「ディレクトリ構成」が変更された場合：**
- `ls-lint-sync` ルールがトリガーされ、このファイルが読み込まれる
- AI は `ARCHITECTURE.md` の最新の「ディレクトリ構成」と `.opencode/instructions/naming-conventions.md` のルールに基づき、`.ls-lint.yml` を更新する
- これは AI エージェントが自律的に行う（人間の介入不要）
- 既存ファイルの名前がルールに違反する場合は、人間に報告し修正方針の指示を仰ぐ

**ls-lint の実行場面（3層防御）:**

| 場面 | タイミング | 役割 |
|------|-----------|------|
| pre-commit hook | git commit 前 | コミット時の最終ゲート |
| `.opencode/plugins/lint-and-typecheck.ts` | ファイル編集後 | 開発中のリアルタイムフィードバック |
| GitHub Actions | PR作成時 | CI での最終検証 |

**展開後、ユーザーに以下を案内する:**
> ls-lint をセットアップしました。ファイル名・ディレクトリ名の命名規則を機械的に強制します。
> ファイルを編集するたびに自動でチェックが行われます。
> `ARCHITECTURE.md` の「ディレクトリ構成」セクションが変更された場合は、AI が自動的に `.ls-lint.yml` を更新します。
