#### Go が含まれる場合

**以下のアクションは `.opencode/project-context.md` の「設定ファイルの自動展開レベル」に従う。**

`go.mod` はプロジェクト名が必要なため自動作成しない。

**バージョン管理：** `go.mod` の `go 1.xx` ディレクティブでランタイムバージョンを固定する。
`ARCHITECTURE.md` に記録された Go バージョンを確認し、`go mod init` 後に `go.mod` の `go` 行を該当バージョンに書き換える。

**インストール：** gofmt / go vet は Go 標準ツールのため追加インストール不要。

**脆弱性検出ツール（govulncheck）：**
```bash
# govulncheck のインストール
go install golang.org/x/vuln/cmd/govulncheck@latest

# 実行
govulncheck ./...
```
- govulncheck は Go の脆弱性データベース（vuln.go.dev）から脆弱性情報を照合
- `go.mod` の依存関係と実際のコード使用箇所を組み合わせて検出
- 誤検出が少なく、本当に影響を受ける脆弱性のみを報告

ユーザーに以下を案内する：
> Go プロジェクトの場合は `go mod init [モジュール名]` を実行してください。
> gofmt と go vet は Go 標準ツールのため追加インストール不要です。
> lint・フォーマット・脆弱性検出は、ファイルを編集するたびに自動で行われます。
> 検出結果はエディタ上に表示されます。
