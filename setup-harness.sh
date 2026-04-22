#!/bin/bash
# setup-harness.sh
# dev-standardsのテンプレートを新プロジェクトにコピーする
#
# 使い方：
#   1. このスクリプトを新プロジェクトのルートに配置する
#   2. dev-standardsのパスを設定する（DEV_STANDARDS_PATH）
#   3. ./setup-harness.sh を実行する
#
# 実行後に必要な作業（人間が行う）：
#   1. AGENTS.md にプロジェクト固有の情報を記入する
#   2. ARCHITECTURE.md に設計情報を記入する
#   3. hooks/*.example の .example を外してプロジェクトに合わせて修正する

set -e

# ========== 設定 ==========
DEV_STANDARDS_PATH="${DEV_STANDARDS_PATH:-../dev-standards}"
PROJECT_PHASE="${1:-prototype}"  # prototype / production / operation
# ==========================

echo "🔧 ハーネスのセットアップを開始します..."
echo "   dev-standards: $DEV_STANDARDS_PATH"
echo "   フェーズ: $PROJECT_PHASE"
echo ""

# dev-standardsの存在確認
if [ ! -d "$DEV_STANDARDS_PATH" ]; then
  echo "❌ dev-standards が見つかりません: $DEV_STANDARDS_PATH"
  echo "   DEV_STANDARDS_PATH 環境変数でパスを指定してください"
  exit 1
fi

SNIPPETS="$DEV_STANDARDS_PATH/snippets"

# .claude/ ディレクトリ作成
mkdir -p .claude/{rules,skills,agents,hooks,usage}

# ===== AGENTS.md のコピー =====
AGENTS_SRC="$SNIPPETS/agents/AGENTS.${PROJECT_PHASE}.md"
if [ -f "$AGENTS_SRC" ]; then
  cp "$AGENTS_SRC" AGENTS.md
  echo "✅ AGENTS.md をコピーしました（フェーズ: $PROJECT_PHASE）"
else
  echo "⚠️  AGENTS.${PROJECT_PHASE}.md が見つかりません。prototype を使用します"
  cp "$SNIPPETS/agents/AGENTS.prototype.md" AGENTS.md
fi

# ===== ARCHITECTURE.md のコピー =====
cp "$SNIPPETS/ARCHITECTURE.md.template" ARCHITECTURE.md
echo "✅ ARCHITECTURE.md をコピーしました"

# ===== .claude/ 内のファイルをコピー =====
# coding-conventions
cp "$SNIPPETS/.claude/coding-conventions.md.template" .claude/coding-conventions.md
echo "✅ .claude/coding-conventions.md をコピーしました"

# project-context
cp "$SNIPPETS/.claude/project-context.md.template" .claude/project-context.md
echo "✅ .claude/project-context.md をコピーしました"

# rules テンプレート
cp "$SNIPPETS/.claude/rules/_template.md" .claude/rules/_template.md
echo "✅ .claude/rules/_template.md をコピーしました"

# skills テンプレート
cp -r "$SNIPPETS/.claude/skills/_template" .claude/skills/_template
echo "✅ .claude/skills/_template/ をコピーしました"

# サブエージェント定義をコピー
for AGENT_FILE in "$SNIPPETS/agents/subagents/"*.md; do
  if [ -f "$AGENT_FILE" ]; then
    cp "$AGENT_FILE" .claude/agents/
  fi
done
echo "✅ .claude/agents/ にサブエージェント定義をコピーしました"

# Hooks サンプルをコピー
cp "$SNIPPETS/.claude/hooks/"* .claude/hooks/
echo "✅ .claude/hooks/ にHooksサンプルをコピーしました"

# 使用履歴ファイルをコピー
cp "$SNIPPETS/.claude/usage/"* .claude/usage/
echo "✅ .claude/usage/ に使用履歴ファイルをコピーしました"

# handoff-artifact の雛形を作成
cat > .claude/handoff-artifact.md << 'EOF'
# Handoff Artifact

<!-- セッション終了時にAIが記入する。または post-session.sh で自動生成 -->
<!-- 次のセッション開始時にこのファイルをAIに渡す -->

## 前のセッションの状態

**取り組んでいた機能**:
**完了した部分**:
**途中で止まっている部分**:
**次にやるべきこと**:

## 重要な決定事項

## 未解決の問題
EOF
echo "✅ .claude/handoff-artifact.md を作成しました"

# .gitignore に追加
if [ -f ".gitignore" ]; then
  # handoff-artifact はセッション固有なのでgitignore推奨
  if ! grep -q "handoff-artifact.md" .gitignore; then
    echo "" >> .gitignore
    echo "# ハーネス（セッション固有）" >> .gitignore
    echo ".claude/handoff-artifact.md" >> .gitignore
    echo ".claude/usage/" >> .gitignore
    echo "✅ .gitignore を更新しました"
  fi
fi

echo ""
echo "🎉 セットアップ完了！"
echo ""
echo "次に行うこと（人間が記入）："
echo "  1. AGENTS.md       → プロジェクト名・目的・現在のタスクを記入"
echo "  2. ARCHITECTURE.md → 技術スタック・層のルール・非機能要件を記入"
echo "  3. .claude/coding-conventions.md → 言語固有の規約を確認・調整"
echo ""
echo "Hooksを有効にする場合："
echo "  .claude/hooks/*.example の .example を外してプロジェクトに合わせて修正"
echo "  chmod +x .claude/hooks/*.sh"
echo ""
echo "参考ドキュメント："
echo "  $DEV_STANDARDS_PATH/principles/harness-engineering.md"
