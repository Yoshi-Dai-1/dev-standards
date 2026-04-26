# dev-standards

AIとともに開発するためのハーネスエンジニアリングのナレッジベース。
あらゆるプロジェクト種別に横断的に適用できる設計思想・テンプレート・原則を集積する。

---

## このリポジトリの位置づけ

```
dev-standards（このリポジトリ）
  = ハーネスの設計図・テンプレート集

各プロジェクトの .claude/
  = 実際に機能するハーネス本体

dev-standardsをプロジェクトに「配置」しても機能しない。
setup-harness.sh でテンプレートをコピーして、
プロジェクト固有の情報を記入することで初めて機能する。
```

---

## 構成

```
dev-standards/
  setup-harness.sh              ★ 新プロジェクト開始時に使うセットアップスクリプト

  principles/                   汎用原則（読む・参照する）
    harness-engineering.md      ハーネスの全体像・5つの原則・タスク規模別構成
    project-definition.md       フェーズ0：目的・要件・制約・セキュリティ要件の定義
    directory-structure.md      ディレクトリ設計の根本思想
    naming-conventions.md       命名規則
    file-size-and-cohesion.md   行数指針・凝集度
    ssot-and-constants.md       SSOT管理
    non-functional-requirements.md  非機能要件の定義（8カテゴリ）
    tdd-with-ai.md              AI協働TDDの手順
    code-review.md              レビューの観点
    code-quality.md          ★ コード品質の6軸・劣化モデル・設計原則
    risk-based-approach.md   ★ リスクベース判断・脅威マップ・優先度フレーム
    security-implementation.md ★ 認証・セキュリティ実装のAIへの問い方
    resilience.md            ★ 壊れても死なない設計・バックアップ・多層防御
    commercial-operations.md ★ 商用固有：SLA/SLO・ブランチ戦略・インシデント管理・監査ログ
    subagents.md                サブエージェントの設計と活用
    production-readiness.md     本番リリース前チェックリスト（9カテゴリ）
    production-deployment.md    本番移行ガイド（12因子・DDD・監視）

  architectures/                プロジェクト種別ごとの構成パターン
    _how-to-choose.md           ★ 種別の選び方（フローチャート）← まずここを読む
    web-frontend-large.md / web-frontend-small.md
    backend-api.md / monorepo.md
    data-pipeline.md / document-project.md

  decisions/                    判断の記録（ADR・技術選定）
    skill-candidates.md         スキル化候補（AIが自動追記）

  snippets/                     テンプレート集（コピーして使う）
    ARCHITECTURE.md.template    ★ セキュリティ・品質・依存関係リスクセクション追加
    tech-decision.md.template
    .gitignore.template
    .env.example.template
    tsconfig.base.json

    agents/                     AGENTS.mdテンプレート（フェーズ別・60〜100行）
      AGENTS.prototype.md       開発フェーズ用  ← 最初はこれ
      AGENTS.production.md      本番移行フェーズ用
      AGENTS.operation.md       運用フェーズ用（★月次診断チェックリスト追加）
      subagents/                サブエージェント定義ファイル
        code-reviewer.md
        security-auditor.md
        test-generator.md
        codebase-investigator.md
        resilience-checker.md   ★ レジリエンス診断（月次GC時に使用）
        code-quality-auditor.md ★ コード品質診断（月次GC時に使用）

    .claude/                    ハーネス雛形（setup-harness.shがコピーする）
      rules/
        _template.md            ルールファイルの書き方テンプレート
      skills/
        _template/SKILL.md      スキルファイルの書き方テンプレート
      hooks/
        README.md               Hooksの説明・ツール対応状況
        post-skill-run.sh.example   スキル使用履歴の自動記録
        pre-commit.sh.example       コミット前セキュリティチェック
        post-session.sh.example     セッション終了時handoff生成
      usage/
        skill-usage.md          スキル使用履歴（Hooksが自動追記）
        rule-hits.md            ルール参照履歴
      project-context.md.template
      coding-conventions.md.template
```

---

## 新プロジェクト開始時の手順

### Step 0：dev-standards を PC に取得する（初回のみ）

```bash
# GitHubからdev-standardsをダウンロードする（1回だけ実行）
# 自分のPC上の任意の場所で実行する
cd ~/Documents   # または好きな場所
git clone https://github.com/[あなたのユーザー名]/dev-standards.git
```

これで `~/Documents/dev-standards/` フォルダが作られる。以降は不要。

### Step 1：新プロジェクトのフォルダを作る

```bash
# dev-standards の隣にプロジェクトフォルダを作成する（推奨）
cd ~/Documents
mkdir my-new-project
cd my-new-project
```

**推奨配置：**
```
Documents/
  dev-standards/       ← 複数プロジェクトで共有する（ここには触らない）
  my-project-a/        ← 新しいプロジェクト
  my-project-b/
```

### Step 2：セットアップスクリプトを実行する

```bash
# my-new-project/ の中で実行する
# DEV_STANDARDS_PATH = dev-standardsがどこにあるか
# bash = シェルスクリプトを実行する命令
# ../dev-standards/setup-harness.sh = 実行するスクリプトのパス
# prototype = フェーズ指定（省略可・デフォルトはprototype）

DEV_STANDARDS_PATH=../dev-standards bash ../dev-standards/setup-harness.sh prototype
```

実行するとハーネスのファイル構造が展開される（骨格のみ）。

### Step 3：AIと対話しながら3つのファイルを作成する

**スクリプト実行直後は骨格だけが存在する状態。以下の順番でAIと対話しながら記入する。**

#### 3-1：`docs/project-definition.md` を作る

```
dev-standards/principles/project-definition.md にある対話プロンプトをAIに渡す。
AIが質問を1つずつ投げかけるので答えていく。
完成したら docs/project-definition.md として保存する。
```

#### 3-2：`ARCHITECTURE.md` を記入する

```
ARCHITECTURE.md の冒頭にある対話プロンプトをAIに渡す。
docs/project-definition.md を参照しながらAIが一緒に埋めてくれる。
```

#### 3-3：`AGENTS.md` を記入する

```
AGENTS.md の Project Overview のコメント内にある対話プロンプトをAIに渡す。
ARCHITECTURE.md の内容をもとにAIが一緒に埋めてくれる。
```

この3ステップが完了して初めてハーネスとして機能し始める。

### Step 4：（任意）Hooksを有効にする

```bash
# .claude/hooks/ に .example がついたファイルがある
# .example を外してプロジェクトに合わせて修正する
cp .claude/hooks/post-skill-run.sh.example .claude/hooks/post-skill-run.sh
# ← ファイルを編集してプロジェクトのパスに合わせる
chmod +x .claude/hooks/*.sh
```

### Step 5：AIとの最初のセッションで dev-standards のパスを伝える

```
以下のファイルを参照しながら作業してください：
- AGENTS.md（このプロジェクトの作業指示）
- ARCHITECTURE.md（設計の詳細）
- dev-standardsの原則ファイル（パス：../dev-standards/principles/）
```

---

## 開発フローとファイルの対応

```
フェーズ0 プロジェクト定義    → principles/project-definition.md
                               ★ セキュリティ要件・リスク評価セクションを必ず記入
                               ★ 商用の場合は principles/commercial-operations.md を参照
フェーズ1 技術選定            → snippets/tech-decision.md.template → decisions/
フェーズ2 アーキテクチャ決定  → architectures/_how-to-choose.md で種別を選ぶ
                               → 該当の architectures/*.md を通読する
                               → ARCHITECTURE.md を記入する
                               ★ セキュリティ・コード品質・依存関係リスクセクションも記入
フェーズ3 ハーネスセットアップ → setup-harness.sh を実行
フェーズ4 実装（TDD）         → principles/tdd-with-ai.md
                               → 認証・機密データを扱う実装は
                                 principles/security-implementation.md を参照
                               .claude/rules/（同じ指摘を2回したら追加）
                               .claude/skills/（3回以上繰り返したら追加）
フェーズ5 コードレビュー      → @code-reviewer / principles/code-review.md
                               ★ @security-auditor（認証・機密データ実装後は必須）
フェーズ6 本番移行            → AGENTS.mdをAGENTS.production.mdに切り替え
                               principles/production-deployment.md
                               principles/production-readiness.md（9カテゴリ確認）
フェーズ7 運用                → AGENTS.mdをAGENTS.operation.mdに切り替え
フェーズ8 月次GC              → @resilience-checker（★レジリエンス診断）
                               → @code-quality-auditor（★コード品質診断）
                               → .claude/usage/ を参照してGCを実施
```

---

## ハーネスの育て方

```
Day 1  ：setup-harness.sh → AGENTS.mdとARCHITECTURE.mdを記入
         ★ project-definition.mdのセキュリティ要件・リスク評価も記入
Week 1 ：同じ指摘を2回した → .claude/rules/ に追加
Week 2 ：3回以上繰り返した作業 → .claude/skills/ に追加
Month 1：@resilience-checker と @code-quality-auditor を初回実行
         usage/ を見てGCを実施（使われないものを削除）
以降   ：問題にぶつかるたびに追加・月次で診断・定期的に削除
```

詳細は `principles/harness-engineering.md` を参照。

---

## 更新ルール

- `principles/` の原則を変更する場合は理由を `decisions/` に記録する
- `architectures/` はプロジェクト経験に基づいて随時更新する
- `decisions/` は削除しない
- `snippets/` の設定ファイルは動作確認したものだけを入れる
- `decisions/skill-candidates.md` はスキル化候補を記録する（記録のタイミングは同ファイル参照）
