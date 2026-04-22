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
    project-definition.md       フェーズ0：目的・要件・制約の定義
    directory-structure.md      ディレクトリ設計の根本思想
    naming-conventions.md       命名規則
    file-size-and-cohesion.md   行数指針・凝集度
    ssot-and-constants.md       SSOT管理
    non-functional-requirements.md  非機能要件の定義
    tdd-with-ai.md              AI協働TDDの手順
    code-review.md              レビューの観点
    subagents.md                サブエージェントの設計と活用
    production-readiness.md     本番リリース前チェックリスト
    production-deployment.md    本番移行ガイド（12因子・DDD・監視）

  architectures/                プロジェクト種別ごとの構成パターン
    web-frontend-large.md / web-frontend-small.md
    backend-api.md / monorepo.md
    data-pipeline.md / document-project.md

  decisions/                    判断の記録（ADR・技術選定）
    skill-candidates.md         スキル化候補（AIが自動追記）

  snippets/                     テンプレート集（コピーして使う）
    ARCHITECTURE.md.template
    tech-decision.md.template
    .gitignore.template
    .env.example.template
    tsconfig.base.json

    agents/                     AGENTS.mdテンプレート（フェーズ別・60〜100行）
      AGENTS.prototype.md       開発フェーズ用  ← 最初はこれ
      AGENTS.production.md      本番移行フェーズ用
      AGENTS.operation.md       運用フェーズ用
      subagents/                サブエージェント定義ファイル
        code-reviewer.md
        security-auditor.md
        test-generator.md
        codebase-investigator.md

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

```bash
# 1. 新プロジェクトのルートで実行
DEV_STANDARDS_PATH=/path/to/dev-standards ./setup-harness.sh [prototype|production|operation]

# 2. 生成されたファイルを記入する（人間が行う）
#    - AGENTS.md          プロジェクト名・目的・現在のタスク
#    - ARCHITECTURE.md    技術スタック・層のルール・非機能要件

# 3. 必要に応じてHooksを有効化する
#    .claude/hooks/*.example の .example を外して修正
#    chmod +x .claude/hooks/*.sh
```

---

## 開発フローとファイルの対応

```
フェーズ0 プロジェクト定義    → principles/project-definition.md
フェーズ1 技術選定            → snippets/tech-decision.md.template → decisions/
フェーズ2 アーキテクチャ決定  → architectures/ → ARCHITECTURE.md
フェーズ3 ハーネスセットアップ → setup-harness.sh を実行
フェーズ4 実装（TDD）         → principles/tdd-with-ai.md
                               .claude/rules/（同じ指摘を2回したら追加）
                               .claude/skills/（3回以上繰り返したら追加）
フェーズ5 コードレビュー      → @code-reviewer / principles/code-review.md
フェーズ6 本番移行            → AGENTS.mdをAGENTS.production.mdに切り替え
                               principles/production-deployment.md
フェーズ7 運用                → AGENTS.mdをAGENTS.operation.mdに切り替え
フェーズ8 月次GC              → .claude/usage/ を参照してAIに診断を依頼
```

---

## ハーネスの育て方

```
Day 1  ：setup-harness.sh → AGENTS.mdとARCHITECTURE.mdを記入
Week 1 ：同じ指摘を2回した → .claude/rules/ に追加
Week 2 ：3回以上繰り返した作業 → .claude/skills/ に追加
Month 1：usage/ を見てGCを実施（使われないものを削除）
以降   ：問題にぶつかるたびに追加・定期的に削除
```

詳細は `principles/harness-engineering.md` を参照。

---

## 更新ルール

- `principles/` の原則を変更する場合は理由を `decisions/` に記録する
- `architectures/` はプロジェクト経験に基づいて随時更新する
- `decisions/` は削除しない
- `snippets/` の設定ファイルは動作確認したものだけを入れる
- `decisions/skill-candidates.md` はAIが自動追記する
