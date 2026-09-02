#### Kotlin が含まれる場合

**以下のアクションは `.opencode/project-context.md` の「設定ファイルの自動展開レベル」に従う。**

プロジェクト固有の情報（groupId・artifactId・version）が必要なため自動作成しない。

**バージョン管理：** JVM ランタイムバージョンはビルド設定ファイル（`build.gradle.kts` / `pom.xml`）の `java.toolchain` / `maven-compiler-plugin` で固定する。
`gradle init` または `mvn archetype:generate` 実行後に、`ARCHITECTURE.md` に記録された JVM バージョンに合わせてビルド設定を編集する。

**インストールを実行する（OS別、上から順に試す）：**
```bash
# macOS
brew install ktlint

# Linux（snap が使えない場合は手動ダウンロード）
sudo snap install ktlint
curl -sSLO https://github.com/pinterest/ktlint/releases/latest/download/ktlint && chmod +x ktlint && sudo mv ktlint /usr/local/bin/

# Windows
scoop install ktlint
choco install ktlint
```

**脆弱性検出ツール（OWASP Dependency-Check）：**
```bash
# Gradle プラグイン追加（build.gradle.kts に記述）
plugins {
    id("org.owasp.dependencycheck") version "9.0.7"
}

# 実行
./gradlew dependencyCheckAnalyze

# Maven プラグイン追加（pom.xml に記述）
mvn org.owasp:dependency-check-maven:check
```
- OWASP Dependency-Check はNVDから脆弱性情報を照合
- Kotlin/Java のサードパーティライブラリをスキャン
- Gradle/Maven プラグインとして統合可能

ユーザーに以下を案内する：
> Mavenプロジェクト: `mvn archetype:generate` で対話的に作成してください。
> Gradleプロジェクト: `gradle init` で作成してください。
> lint・フォーマット・脆弱性検出は、ファイルを編集するたびに自動で行われます。
> 検出結果はエディタ上に表示されます。
