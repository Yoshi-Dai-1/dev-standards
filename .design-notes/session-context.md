# セッションコンテキスト（2026-07-19）

## 目標
- SSoT 統合を完了し、ハーネス全体の指示-テンプレート不整合を修正する
- デフォルトを言語ニュートラルに統一（yori は日本語話者のみを対象としない）

## 実施した変更

### 「分からない」→ 再質問 → フォールバック パターンの統一
- **ARCHITECTURE.md.template**: L100 ヘッダー文言 + L187 ルールに rephrase hierarchy 実装
- **INTAKE.md.template** L40: 質問 → 不明 → 代替案提案の3段階に
- **security-designer.md**: L65（初期受け付け）、L97、L221（推奨値提案）×3箇所に同パターン
- 統一ルール：質問を言い換える → 追加質問 → プロジェクト最適化のフォールバック値（即フォールバック禁止）

### 日本中心デフォルト → 言語ニュートラル（7ファイル）
- **ARCHITECTURE.md.template** i18n セクション: `日本語のみ`→`単一言語（___）`、`Asia/Tokyo`→UTC、`Google翻訳API`→`翻訳API（___）`
- **AGENTS.md** L190: `平易な日本語で`→`平易な言葉で`
- **DESIGN.md.template**: タイポグラフィ/禁則/Do's/Don'ts 言語ニュートラル化。行間範囲指定で欧文・日本語両方カバー
- **INTAKE.md.template** Step 3: `日本語タイポグラフィの確認`→`タイポグラフィの確認（プロジェクトの主要言語に合わせて質問）`
- **security-designer.md**: `日本語ドキュメントが充実`→`ドキュメントが充実`、決済プロバイダーを地域別選択式に

### セクション名の修正
- **AGENTS.md 0-b**: `Security/Risk`→`Security Constraint/Risk Assessment`（テンプレートの正式セクション名に統一）
- **AGENTS.md 0-b**: `5項目 + Security/Risk`→`全セクション（7つをフラットに列挙）` + What は Must/Won't + Should/Could、Security/Risk スキップ禁止
- **`_step-36-arch.md` L14**: `## Boundaries`→`## Boundaries（禁止事項）`
- **security-requirements.md L25**: 同上 + L173 `secrets スキャン`→`シークレットスキャン`

### `_trigger-project-definition.md` 全面書き換え（13行→18行）
- 旧：5項目列挙 + DoD vs Security 問題 + ファイル名のみ参照
- 新：セクション非列挙 + 波及ロジック例示 + 全ファイル参照をフルパスに統一 + DESIGN.md 条件付き追加
- 初回作成時の整合性チェックを AGENTS.md 0-f に追加（Step 1 と handoff の間）

### AGENTS.md 0-f に整合性確認ステップ追加
- 0-f の流れ: 完了確認 → **整合性確認（NEW）** → handoff → 削除 → 新規セッション促し
- DESIGN.md は作成された場合のみ対象

### 不正確なクロスリファレンスの修正
- **ARCHITECTURE.md.template L335**: `Step 3`→`Step 2-3（対応レベルの決定・適用される法令・標準の特定）`
- **security-designer.md L48**: `「フレームワーク・主要ライブラリ」欄`→`「技術スタック」セクションの「フレームワーク」行と「言語」行`

### `自動生成`→`生成`（2ファイル）
- **ARCHITECTURE.md.template L398**: AI のガイド動作を「生成」と表現
- **`_step-36-arch.md` L45**: 同上

### handoff/SKILL.md コードブロックインデント統一
- 4/5/6スペース混在 → 3/4スペースに統一

## 最終レビュー結果（確定）
- 4件の修正（AGENTS.md 5項目リスト、trigger ファイルの項目リスト+字下げ、security-designer カラムスコープ）
- 6件は対応不要（既存問題・スコープ外）
- 全クロスリファレンス：「## Boundaries（禁止事項）」統一、「シークレットスキャン」統一、「Security Constraint/Risk Assessment」統一
- 修正後レビュー：見落とし・矛盾・冗長・誤字脱字なし

## 残作業
- なし（本セッション完了）

## 最終変更ファイル一覧
- `opencode/snippets/ARCHITECTURE.md.template` — i18n, 分からない hierarchy, 自動生成→生成, L335 comment
- `opencode/snippets/agents/AGENTS.md` — 0-b セクション名/構成, 0-f 整合性確認追加, 日本語→言葉
- `opencode/snippets/DESIGN.md.template` — タイポグラフィ言語ニュートラル化
- `opencode/snippets/design/INTAKE.md.template` — Step 3 言語ニュートラル化
- `opencode/snippets/agents/subagents/security-designer.md` — 分からない×3, 決済地域別, セクション名修正, カラムスコープ
- `opencode/snippets/.opencode/instructions/stack-setup/_step-36-arch.md` — Boundaries 見出し, 自動生成→生成
- `opencode/principles/security-requirements.md` — Boundaries 見出し, secrets→シークレット
- `opencode/snippets/.opencode/instructions/security/_trigger-project-definition.md` — 全面書き換え, フルパス, DESIGN.md 条件付き追加
- `opencode/snippets/.opencode/skills/handoff/SKILL.md` — コードブロックインデント統一
- `.design-notes/session-context.md` — 更新
