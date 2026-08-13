# Session Context

## ステージ済みの変更
- `opencode/snippets/opencode.json.template`: `instructions[]` に `.opencode/instructions/naming-conventions.md` を追加（常時読込化。5ファイル構成）
- `opencode/snippets/.opencode/instructions/naming-conventions.md`: 「優先チェーン（ARCHITECTURE(SSOT) > coding-conventions > 本ファイル > フレームワーク規約）」+「自己充足的コア表（ケーススタイル・ディレクトリ名・ファイル名・テストファイル命名規則）」を追加し、自律トリガー・常駐禁止事項をコア表参照に書き換え（1.8KB→6.2KB）
- `opencode/principles/naming-conventions.md`: コア表（ケーススタイル一覧・ディレクトリ名・ファイル名・テストファイル命名規則）を instruction へ移動し、冒頭に「コア表は instructions が SSOT」注記。判断フローを4段階に更新。Step 1 の「このファイルの冒頭のケーススタイル一覧」参照を instruction 参照に修正
- `opencode/snippets/ARCHITECTURE.md.template`: 命名規則セクションのベースルール参照を `.opencode/instructions/naming-conventions.md`（常時読込）に変更
- `opencode/snippets/.opencode/plugins/rule-injector.ts`:
  - リトライバイパス修正: `conventionsOffered` を「全規約読了済み」の意味に変更。未読のまま再試行しても再ブロック
  - 規約ゲート対象を directory-structure / coding-conventions の2ファイルに変更（naming は常時読込のため除外）
  - `TEST_FILE_PATTERN` を定数化し tdd-cycle ルールと共有
  - tdd-cycle ハードゲート追加（テストファイル write/edit 時、未読なら throw）
  - bash `mkdir` 検知ゲート追加（directory-structure 未読なら throw）
  - 既存 RULES 注入の noReply をバッチ化（複数該当時は1回の prompt に列挙）
  - `resetAfterCompaction` に `conventionsOffered=false` / `conventionsRead.clear()` を追加（コンパクション後は単発ハードゲート再起動）
- `opencode/snippets/.opencode/plugins/README.md`: rule-injector 詳細（作用フロー・検出ルール表・BLOCK 詳細・初期状態）を新設計に更新
- `opencode/principles/naming-conventions.md`: 「このファイルの使い方」の判断フローを優先チェーンと整合（言語別(2) → 基本コア表(3) → 確定手順(4)）に並び替え。**コア表は principle → instruction へ移設**
- `opencode/snippets/.opencode/instructions/stack-setup/_step-35.md`: 「命名規則の確定手順」参照を `.opencode/standards/principles/naming-conventions.md` に明確化
- `opencode/snippets/.opencode/instructions/naming-conventions.md`: 優先チェーン表の「3 までで決まらない場合」＋行3の確定手順参照パス明記。**コア表（ケーススタイル・ディレクトリ名・ファイル名・テストファイル命名規則）が SSOT として移設**
- `.design-notes/session-context.md`: 本ファイル更新

## 未解決の課題
- 検証用プロジェクト（v1120test 等）の opencode.json は上書き保護（戦略 A）のため、naming-conventions.md の常時化が自動反映されない。opencode.json に一行手動追加が必要（`.opencode/instructions/naming-conventions.md`）。プロジェクト固有の編集を尊重するため自動変更しない
- touch / 非 mkdir によるファイル作成はゲート対象外のまま（ユーザー確認済み・現状維持）

## 次のセッションでやること
- ステージ済み変更のコミット可否を人間に確認する（commit/push は人間の指示があるまで実行しない）
- v1120test で新設計の実地検証（初回セッションで mkdir / テストファイル書き込みがゲートされること）

## 検証メモ（2026-08-13）
- テストハーネス: `/var/folders/2r/4xmj5zsd5736vnnwzp3gj1x40000gn/T/opencode/archdiag-test/`
  - `test-arch-diag.ts` 13件 / `test-rule-injector.ts` 12件（新規9件: リトライバイパス・読了後パス・tdd ゲート・mkdir ゲート・バッチ化・コンパクション再起動）/ `test-template.ts` 1件 / `test-plugins-consistency.ts` **36件**（新規9件: 常時化整合性 + 優先チェーンの並び順回帰2件） PASS（計62件）
- 全 Plugin typecheck: `bunx --bun tsc --noEmit --strict --skipLibCheck --types bun plugins/*.ts` でエラーゼロ
- 新規配布検証: 一時ディレクトリで setup-harness.sh 実行 → opencode.json に naming-conventions.md が含まれ、`.opencode/instructions/naming-conventions.md`・`.opencode/standards/principles/naming-conventions.md`・`.opencode/instructions/stack-setup/_step-35.md` が最新配布されることを確認。STALE_REF チェック（principles 旧参照）0件
- tdd/mkdir ゲートは設計メモの `tddGateFired` / `mkdirGateFired` フラグ方式ではなく readByAI / conventionsRead ベースで実装（未読の限り再ブロック）。リトライバイパス修正の原則と一貫し、コンパクションリセットで再武装される
- 事後レビュー（2026-08-13）で修正した参照不整合:
  1. instruction 優先チェーン表の内部矛盾（コア表4th と言語別優先注記）→ 言語別・フレームワーク(3) > コア表(4) に統一
  2. principle「使い方」フロー（コア表2nd → 言語別3rd）が優先チェーンと逆順 → 言語別(2) → 基本コア表(3) → 確定手順(4) に揃えた
  3. `_step-35.md:15` の `naming-conventions.md` 曖昧参照 → `.opencode/standards/principles/naming-conventions.md` を明記。principle「確定手順」ヘッダも `_step-35.md` を明記
  4. instruction:92 の「principle の」曖昧参照 → フルパス化