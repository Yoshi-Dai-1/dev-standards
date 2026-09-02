#### PHP が含まれる場合

**以下のアクションは `.opencode/project-context.md` の「設定ファイルの自動展開レベル」に従う。**

> **Plugin 層の注意**：PHP は `.opencode/plugins/lint-and-typecheck.ts` での per-edit チェックをスキップしています。
> 理由は高速CLIツール不在のため。プロジェクト固有の Composer 経由（PHPStan / Psalm）で品質チェックしてください。

プロジェクト固有の情報（ベンダー名・パッケージ名・description）が必要なため自動作成しない。

**バージョン管理：** `composer.json` の `require.php` フィールドで PHP バージョンを固定する。
`composer init` 実行後に、`ARCHITECTURE.md` に記録された PHP バージョンに合わせて `composer.json` の `require.php` を編集する。
例：`"php": ">=8.2"`

**インストールを実行する（全OS対応）：**
```bash
# プロジェクトローカル（優先）
composer require --dev phpstan/phpstan
composer require --dev vimeo/psalm

# プロジェクトローカルが失敗した場合にグローバルを試す
composer global require phpstan/phpstan
```
`composer` 未インストールの場合は `https://getcomposer.org/download/` から各OS向けにインストールする。

**脆弱性検出ツール（Composer Audit）：**
```bash
# 実行
composer audit
```
- Composer Audit は PHP Advisory Database から脆弱性情報を照合
- `composer.lock` の全パッケージをスキャン
- 脆弱性が見つかった場合は修正バージョンを提案

ユーザーに以下を案内する：
> PHP プロジェクトの場合は `composer init` で初期化してください。
> lint・フォーマット: PHPStan / Psalm を推奨します（静的解析）。
> これらは Composer 経由で実行するため、`.opencode/plugins/` ではなくプロジェクト側の設定で管理します。
> 脆弱性検出には Composer Audit が有効です。
