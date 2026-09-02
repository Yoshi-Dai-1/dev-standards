#### Ruby が含まれる場合

**以下のアクションは `.opencode/project-context.md` の「設定ファイルの自動展開レベル」に従う。**

`Gemfile` はプロジェクト固有のため自動作成しない。

**バージョン管理：** `.ruby-version` でランタイムバージョンを固定する。
`ARCHITECTURE.md` に記録された Ruby バージョンを `.ruby-version` に書き込む：
```
3.3
```
（バージョンは `ARCHITECTURE.md` に記録されたバージョンを優先する。
未記録の場合は上記デフォルト値を使い、後で変更できると案内する）

**インストールを実行する（全OS対応）：**
```bash
gem install rubocop bundler-audit
```
`gem` は Ruby に同梱。未インストールの場合は `https://www.ruby-lang.org/` からインストールする。

**脆弱性検出ツール（bundler-audit）：**
```bash
# 実行（Gemfile.lock が存在する場合のみ）
bundle-audit check --update
```
- bundler-audit は Ruby Advisory DB から脆弱性情報を照合
- `Gemfile.lock` の全パッケージをスキャン
- `--update` で脆弱性データベースを最新に更新してからスキャン

ユーザーに以下を案内する：
> Ruby プロジェクトの場合は `bundle init` を実行してください。
> RuboCop は lint・フォーマット両方を担当します。`gem install rubocop` でインストールしてください。
> lint・フォーマット・脆弱性検出は、ファイルを編集するたびに自動で行われます。
> 検出結果はエディタ上に表示されます。
