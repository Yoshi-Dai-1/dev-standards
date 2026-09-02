#### Dependabot（依存関係自動更新）の設定

Dependabot は GitHub の依存関係自動更新機能。
セキュリティパッチとバージョン更新を自動でPR作成する。

**`ARCHITECTURE.md` の「技術スタック」の内容に基づき、プロジェクトで使用しているエコシステムを確認する。**

**`.github/dependabot.yml` の生成・更新手順：**

1. `ARCHITECTURE.md` の「技術スタック」の内容に基づき、使用言語・パッケージマネージャーを特定する
2. 該当するエコシステムのセクションだけを残し、それ以外は削除する
3. `schedule.interval` は「weekly」を基本とする（セキュリティ重要な場合は「daily」）
4. `open-pull-requests-limit` は10を基本とする

**対応エコシステム一覧：**

| エコシステム | 対応言語 | package-ecosystem 値 |
|-------------|---------|---------------------|
| npm/yarn/pnpm | JavaScript/TypeScript | `npm` |
| pip | Python | `pip` |
| cargo | Rust | `cargo` |
| go modules | Go | `gomod` |
| bundler | Ruby | `bundler` |
| composer | PHP | `composer` |
| NuGet | C# | `nuget` |
| Gradle/Maven | Java/Kotlin | `gradle` |
| GitHub Actions | CI/CD | `github-actions` |
| Docker | コンテナ | `docker` |

**`ARCHITECTURE.md` の「技術スタック」が変更された場合：**
- 新しい言語が追加された → 該当するエコシステムのセクションを追加する
- 言語が削除された → 該当するエコシステムのセクションを削除する
- パッケージマネージャーが変わった → package-ecosystem の値を更新する

**依存関係のバージョン更新ルール：**
- Dependabot が作成するPRは自動的にテストが実行される
- テストが通ればマージを推奨
- テストが失敗した場合は手動で対応が必要（人間に報告）

**セキュリティ更新の活用：**
- GitHub の Security タブで Dependabot Alerts を確認する
- 脆弱性のあるパッケージは自動的に修正PRが作成される
- 重大な脆弱性は即座にマージを検討する

**`.github/dependabot.yml` テンプレート：**
```yaml
version: 2
updates:
  # 使用しているエコシステムのみ記述する
  # ARCHITECTURE.md の「技術スタック」から判断する
```

**展開後、ユーザーに以下を案内する：**
> Dependabot を設定しました。依存関係の更新と脆弱性検出が自動で行われます。
> GitHub の Security タブで Dependabot Alerts を確認できます。
