#### C/C++ が含まれる場合

**以下のアクションは `.opencode/project-context.md` の「設定ファイルの自動展開レベル」に従う。**

ビルドシステム・コンパイラ設定がプロジェクト固有のため自動作成しない。

**インストールを実行する（OS別）：**
```bash
# macOS
brew install clang-format

# Linux (Debian/Ubuntu)
sudo apt install clang-format

# Linux (RHEL/Fedora)
sudo dnf install clang-format

# Windows（上から順に試す）
choco install llvm
scoop install llvm
winget install LLVM.LLVM
```
> **注：** clang-tidy は `.opencode/plugins/lint-and-typecheck.ts` では実行しません（遅すぎるため）。
> CI パイプラインでのみ実行することを推奨します。

**脆弱性検出ツール（OWASP Dependency-Check）：**
```bash
# macOS
brew install dependency-check

# Linux (Debian/Ubuntu)
sudo apt install dependency-check

# 実行
dependency-check --project "Project Name" --scan . --format HTML
```
- OWASP Dependency-Check はNVD（National Vulnerability Database）から脆弱性情報を照合
- C/C++ のサードパーティライブラリをスキャン
- HTML レポートで結果を確認

ユーザーに以下を案内する：
> ビルド設定ファイル（`CMakeLists.txt` / `Makefile`）をプロジェクトに合わせて作成してください。
> フォーマット: clang-format、lint: clang-tidy を推奨します。
> `clang-format --style=LLVM -i [ファイル]` でフォーマットできます。
> 脆弱性検出には OWASP Dependency-Check が有効です。

---

#### C# が含まれる場合

**以下のアクションは `.opencode/project-context.md` の「設定ファイルの自動展開レベル」に従う。**

プロジェクト固有の情報が必要なため自動作成しない。

**バージョン管理：** `global.json` で .NET SDK バージョンを固定する。
`ARCHITECTURE.md` に記録された .NET バージョンから以下のテンプレートで作成する：
```json
{
  "sdk": {
    "version": "8.0.0"
  }
}
```
（バージョンは `ARCHITECTURE.md` に記録されたバージョンを優先する。未記録の場合はインストール済み SDK の最新安定版を使う）

**インストール（全OS対応）：** .NET SDK に `dotnet format` が標準で含まれているため、追加インストール不要。
.NET SDK 未インストールの場合は `https://dotnet.microsoft.com/download` から各OS向けにインストールする。

**脆弱性検出ツール（dotnet list package --vulnerable）：**
```bash
# 実行
dotnet list package --vulnerable
```
- .NET SDK 標準の脆弱性検出機能
- NuGet の脆弱性データベースから脆弱性情報を照合
- `--vulnerable` フラグで脆弱性のあるパッケージのみ表示

ユーザーに以下を案内する：
> `dotnet new [テンプレート名]` でプロジェクトを作成してください。
> （例: `dotnet new webapi` / `dotnet new console` / `dotnet new classlib`）
> lint・フォーマット・脆弱性検出は、ファイルを編集するたびに自動で行われます。
> 検出結果はエディタ上に表示されます。
