#### Swift が含まれる場合

**以下のアクションは `.opencode/project-context.md` の「設定ファイルの自動展開レベル」に従う。**

`Package.swift` はプロジェクト固有のため自動作成しない。

**バージョン管理：** `.swift-version` でランタイムバージョンを固定する。
`ARCHITECTURE.md` に記録された Swift バージョンを `.swift-version` に書き込む。
未記録の場合は Swift ツールチェーンのデフォルトバージョンを使う。

**インストールを実行する（OS別）：**
```bash
# macOS
brew install swift-format swiftlint

# Linux (Debian/Ubuntu)
apt-get install swiftlint
# swift-format: Swift ツールチェーンに同梱。未同梱の場合は brew またはソースビルド

# Windows（上から順に試す）
wsl apt-get install swiftlint   # WSL 環境
choco install swiftlint         # WSL がない場合
```
Swift の公式ツールチェーンは `https://www.swift.org/install/` から各OS向けにインストール可能。

**脆弱性検出ツール：**
Swift には公式の脆弱性検出ツールがありません。サードパーティツールとして以下を推奨します：
```bash
# GitHub Advisory Database を活用（推奨）
# Swift Package Manager の依存関係をスキャン
swift package show-dependencies --format json
```
- Swift Package Manager の依存関係を確認し、GitHub Advisory Database で脆弱性を手動確認
- 将来的には公式ツールが追加される可能性があります

ユーザーに以下を案内する：
> Swift プロジェクトの場合は `swift package init` を実行してください。
> フォーマット: `swift-format --in-place`、lint: `swiftlint` を推奨します。
> lint・フォーマットは、ファイルを編集するたびに自動で行われます。
> 検出結果はエディタ上に表示されます。
