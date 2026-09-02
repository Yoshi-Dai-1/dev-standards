#### Rust が含まれる場合

**以下のアクションは `.opencode/project-context.md` の「設定ファイルの自動展開レベル」に従う。**

`Cargo.toml` はプロジェクト固有のため自動作成しない。

**バージョン管理：** `rust-toolchain.toml` でランタイムバージョンを固定する。
`ARCHITECTURE.md` に記録された Rust バージョンから以下のテンプレートで作成する：
```toml
[toolchain]
channel = "stable"
```
（バージョンは `ARCHITECTURE.md` に記録されたバージョンを優先する。未記録の場合は `stable` を使う）

**インストールを実行する（全OS対応）：**
```bash
rustup component add rustfmt clippy
```
`rustup` 未インストールの場合は `https://rustup.rs` からインストールする。

**脆弱性検出ツール（cargo-audit）：**
```bash
# cargo-audit のインストール
cargo install cargo-audit

# 実行
cargo audit
```
- cargo-audit は RustSec の脆弱性データベースから脆弱性情報を照合
- `Cargo.lock` の全パッケージをスキャン
- 脆弱性が見つかった場合は修正バージョンを提案

ユーザーに以下を案内する：
> Rust プロジェクトの場合は `cargo init` を実行してください。
> rustfmt と Clippy は `rustup component add rustfmt clippy` でインストールしてください。
> lint・フォーマット・脆弱性検出は、ファイルを編集するたびに自動で行われます。
> 検出結果はエディタ上に表示されます。
