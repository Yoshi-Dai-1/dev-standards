# Session Context

## ファイル参照のバッククォート＋展開後フルパス統一（2026-08-15 実施・未コミット）

### 監査
- 監査結果: principles/ 96件・architectures/ 48件・instructions/ 88件・agents-plugins-skills 177件の裸ファイル参照を検出
- 展開マッピングは setup-harness.sh から確認: `principles/`→`.opencode/standards/principles/`、`architectures/`→`.opencode/standards/architectures/`、`instructions/_fill-guide.md`→`.opencode/instructions/agents-fill-guide.md`、`skills/`→`.opencode/skills/`、`secret-patterns.json`/`skills.lock.yaml`→`.opencode/config/`、`plugins/*.ts`→`.opencode/plugins/`、`subagents/*.md`→`.opencode/agents/`

### 方針（ユーザー確認済み）
- 影響度順（Phase 1〜5）に優先修正・最終目標は全件
- パス形式: ハーネス展開後フルパスで統一
- ルート配置ファイル（AGENTS.md / ARCHITECTURE.md / DESIGN.md / opencode.json）はベース名のままバッククォートのみ付与
- 対象外: コードフェンス内 / TS 実行用引数（`Bun.file()` 等）/ JSON 値（opencode.json.template の instructions 配列）/ Design Token 参照値（`{primitive.shadow.md}`）/ ユーザー固有サンプル（`src/services/*`）
- TS テンプレートリテラル内のバッククォートは `\`` エスケープが必要
- 検証スキャナ: コードフェンス除去 + バッククォート区間除去後に `(?<![\w./-])([\w./-]+\.(?:md|json|ts|...))(?![\w.-])` で走査（URL 除外）

### 変更（86ファイル・+562/-562）
- Phase 1: `snippets/.opencode/instructions/` 41ファイル（perl 一括 + 個別修正）+ `plugins/*.ts` 9本 + `agents/AGENTS.md`。検証 OUT=0
- Phase 2: `snippets/ARCHITECTURE.md.template` + `DESIGN.md.template`
- Phase 3: `principles/` 全24ファイル（88件、design-contract 23件・harness-engineering 12件が上位）
- Phase 4: `architectures/` 全13ファイル（27件、web-frontend-large 7件・mobile 5件が上位。_how-to-choose.md は違反0）
- Phase 5: `skills/`（release-prep・handoff・live-operation）+ `agents/subagents/` + `docs/*.template` + `design/token-ssot.json.template` + `plugins/README.md` + `usage/` + `project-context`/`coding-conventions`/`.gitignore` テンプレート
- 主なフルパス化: `token-ssot.json`→`design/`・`component-map.json`→`design/`・`stack-setup.md`→`.opencode/instructions/`・`network-resilience.md` 等→`.opencode/standards/principles/`・`mobile.md` 等→`.opencode/standards/architectures/`・`web-frontend-large.md`→`.opencode/standards/architectures/`・`handoff-artifact.md`→`.opencode/`・`skills.lock.yaml`/`secret-patterns.json`→`.opencode/config/`・plugin `.ts`→`.opencode/plugins/`・`tasks.json`/`spec.md`/`project-definition.md`→`docs/`・`release-prep/SKILL.md`→`.opencode/skills/release-prep/SKILL.md`
- `plugins/README.md` は一部 plugins/*.ts を自身が配置される `.opencode/plugins/` 配下としてフルパス化

### 最終検証
- 全対象（snippets/・principles/・architectures/）を再走査し、フェンス外の裸ファイル参照 0 件
- 残存8件は全員対象外: opencode.json.template の JSON 値6件・Design Token 参照値1件・検索クエリ例示1件（production-readiness.md:232 の `[`ARCHITECTURE.md` の...]` はバッククォート境界内）
- 注意: `opencode/snippets/.opencode/node_modules/` がローカルに存在（git 未追跡・.gitignore 除外）. 配布混入リスクはなし

## API 準拠キャスト除去 + session.deleted バグ修正（2026-08-14 実施）

### 変更ファイル（未コミット）
- `opencode/snippets/.opencode/plugins/rule-injector.ts` / `secrets-guard.ts` / `working-dir-guide.ts` / `env-check.ts` / `arch-diag.ts` / `adr-prompt.ts` / `harness-health.ts` / `task-archive.ts`: 不要な `(input as any).sessionID` / `(ev as any).properties?.sessionID` / `(input.args as any)` キャストを除去し、実型（`input.sessionID` / `ev.properties.sessionID` / `input.args`）に置換
- `opencode/snippets/.opencode/plugins/commit-review.ts`: `(child as any).data.id` → `child.data?.id`、`(resp as any).data?.parts || (resp as any).parts` → `resp.data?.parts || []`、`(diffResult as any).text()` → `diffResult.text()`。`client` 引数を `any` → `OpencodeClient`（`@opencode-ai/sdk/client`）に型付け
- `opencode/snippets/.opencode/plugins/lockfile-record.ts`: `(output as any)?.exitCode` は `tool.execute.after` の output 型に exitCode が無いため**必要なキャストとして維持**（唯一の残存 `as any`）
- `opencode/snippets/.opencode/plugins/README.md`: `tool.execute.before`/`after` の引数型を実型（`{tool, sessionID, callID}` / `{tool, sessionID, callID, args}`）に修正。`event` セクションに `session.deleted` は `properties.info.id`（`properties` は `{ info: Session }` で sessionID を持たない）の注記を追加

### session.deleted のバグ修正（今回の主目的の1つ）
- **バグ**: `EventSessionDeleted` の properties は `{ info: Session }`（types.gen.d.ts:505-510）。旧実装は `(ev as any).properties?.sessionID` を参照しており、常に `undefined` → session.deleted 分岐のクリーンアップが**実質発火していなかった**
- **修正**: `ev.properties.info.id` に変更（rule-injector / working-dir-guide / env-check / arch-diag / adr-prompt の5 Plugin）

### 検証
- typecheck: `bunx --bun tsc --noEmit --strict --skipLibCheck --types bun plugins/*.ts` エラーゼロ
- テストハーネス（archdiag-test）で全 PASS（41+12+13=66件）。test-plugins-consistency.ts の session.deleted フィクスチャを `properties.sessionID` → `properties.info.id` に修正（実型と整合）

### 判断基準（ユーザーと確認済みの監査結論から）
- AGENTS.md の `instructions[]` 明記は維持（opencode ソース `instruction.ts` の `systemPaths()` が `Set<string>` で絶対パス管理 → 二重ロードされない）
- lockfile-record の exitCode キャストは API 型の制約上必要（output 型に exitCode フィールドがない）

## code-quality.md 常時化（2026-08-14 実施）

### 変更ファイル
- `opencode/snippets/opencode.json.template`: `instructions[]` に `.opencode/instructions/code-quality.md` を追加（**6ファイル構成**）
- `opencode/snippets/.opencode/instructions/code-quality.md`: 先頭を「コードファイル編集時に Plugin が注入する」→「セッション開始時に常時読み込まれる」に修正。品質6軸・劣化サイン・自律トリガーがセッション開始時点で文脈に存在する
- `opencode/snippets/.opencode/plugins/rule-injector.ts`: RULES から `code-quality` エントリを削除（常時化により noReply 通知が冗長）。`CODE_FILE_PATTERN` は規約ゲートで引き続き使用
- `opencode/snippets/.opencode/plugins/README.md`: 作用フロー（6ファイル記載）・検出テーブル（code-quality 行削除）・BLOCK 詳細・初期状態（6ファイル）を更新
- `opencode/snippets/ARCHITECTURE.md.template`: コード品質セクションに「ベースルール：`.opencode/instructions/code-quality.md`（常時読込）に従う」を追加（naming 常時化時の命名規則セクションと同型）。重複していた「詳細は principles」行を削除
- `opencode/snippets/.opencode/instructions/code-quality.md`: principle 参照（code-quality / cognitive-load-design / file-size-and-cohesion / tdd-with-ai）は維持

### 判断基準（ユーザーと確認済み）
- code-quality.md 常時化の目的: **コードを書く前段階（思考段階）から品質6軸・分割統合の基準を考慮**できるようにする。プラグインはコード編集イベントでしか注入できず、設計・計画段階の品質判断が未保護だった
- code-quality.md は「入り口の instruction」。詳細は principles/ を **必要時に自律的に読みに行く**（naming 常時化と同じ設計パターン）
- **coding-conventions.md は常時化しない**: プロジェクト固有にカスタマイズされるファイル（7.4KB+）で、既に初回書き込みハードゲートで読了100%保証済み。常時化は文脈圧迫のリスクがメリットを上回る
- principles（file-size-and-cohesion / cognitive-load-design / code-quality）は on-demand 維持。約20KB の常時化は文脈圧迫

### テスト
- `test-plugins-consistency.ts`: **41件**（code-quality 常時化チェック4件追加: opencode.json に含まれる / 先頭に常時読込注記 / principle 参照維持 / rule-injector RULES から除外）
- `test-rule-injector.ts`: 12件（テスト6のバッチ化検証を security+network-resilience 同時該当に修正）
- 全テスト PASS（計66件: 12+41+13）

### v1120test 反映
- setup-harness.sh 再実行（YORI_HAS_UI=n / QUALITY_STRATEGY=1 / USAGE_GIT=1）
- `.opencode/instructions/code-quality.md` / `rule-injector.ts` / `plugins/README.md` が yori 最新と SAME
- `opencode.json`: 上書き保護のため手動で code-quality.md 追記（6ファイル構成）
- `ARCHITECTURE.md`: コード品質セクションに「ベースルール：`.opencode/instructions/code-quality.md`（常時読込）」を手動追記（参照先2ファイル実在確認）
- STALE_REF = 0 / 参照先全パス実在

### 常時化ファイル間参照の「（常時読込）」注記付与（2026-08-14 追記）
- **背景（公式ドキュメント調査）**: OpenCode のコンパクションは**会話履歴のみ**を対象とする。instructions（常時化ファイル）はシステムプロンプトとしてリクエスト組み立て時に毎回導出され、コンパクション後も残る。コンパクション自体はソース再読をしない（「Compaction advances the instruction epoch」節）。→ 常時化ファイルへの参照で Read を呼ぶと**本当の冗長読込**になる
- 前回の分析「コンパクション後の再読は自己回復」は不正確 → 訂正。注記が再読防止の有効防御
- **修正**:
  - `agents/AGENTS.md:22`: `cli-first.md` → `cli-first.md`（常時読込）
  - `.opencode/instructions/naming-conventions.md`: ARCHITECTURE.md 参照5箇所（15/74/101/103/113/120）に「（常時読込）」付与
- code-quality.md 内の参照は全て非常時化 principles（正当な on-demand）なので注記不要
- v1120test: naming-conventions.md は setup で自動反映（SAME 確認）。AGENTS.md はプロジェクト固有版で cli-first 参照がないため手動編集不要
- 全テスト PASS（66件: 12+41+13）

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
- 検証用プロジェクト（v1120test 等）の opencode.json は上書き保護（戦略 A）のため、naming-conventions.md / code-quality.md の常時化が自動反映されない。opencode.json に手動追加が必要（v1120test は反映済み）。プロジェクト固有の編集を尊重するため自動変更しない
- touch / 非 mkdir によるファイル作成はゲート対象外のまま（ユーザー確認済み・現状維持）

## 質疑監査（2026-08-14 追記）
- **Q1（常時読込注記の要否）**: **残す判断**。code-quality.md の「このルールはセッション開始時に常時読み込まれる。」は必要。ただし根拠は「naming と同型」ではなく独立判断:
  - 事実: ルール系の常時読込ファイルは全て「常時有効宣言」を持つ（cli-first.md「全セッション・全フェーズで有効」/ naming「常時読み込まれる」/ code-quality 同文）。AGENTS.md（最上位SSOT）と ARCHITECTURE.md（書かれる対象）は宣言を持たないのが一貫
  - 機能: AGENTS.md:8 が「instructions は Plugin がイベント駆動で注入する」と宣言しているため、常時読込ルールが「セッション開始時から有効である」ことの適用タイミング明示が必要。この情報は opencode.json（AIの文脈外）にしか存在せず、ファイル自身の宣言でのみ文脈内で完結 → 真の重複ではない
  - 「無ければ正しく判断できない」は不正確。正しくは「適用タイミングの誤認防止・文書契約」
- **Q2（ARCHITECTURE.md.template の「詳細・深掘りは principles を参照」行）**: **冗長と判断し削除（ユーザー承認済み 2026-08-14）**
  - 根拠: `code-quality.md:5-8`（常時読込）冒頭に同一導線が既にあり、ARCHITECTURE.md も常時読込なので AI の文脈内で同じ情報が既に成立。再掲しても到達手段は増えない
  - 残したのは「ベースルール：`...code-quality.md`（常時読込）に従う。」のみ（適用タイミングの明示として独自機能を持つため）
  - naming セクション（同型）も同時に削除し整合性を確保: `ARCHITECTURE.md.template` 409行（naming）/496行（code-quality）→ 両「詳細・深掘り」行を削除
  - v1120test ARCHITECTURE.md（102-103 / 178-179行）にも手動反映（上書き保護のため）
  - 全66テスト PASS を確認（この行へのテスト依存なし）
- **Q3（監査で検出・修正）**:
  1. `code-review.md:18`: `instructions/naming-conventions.md`（相対パス・注記なし）→ `.opencode/instructions/naming-conventions.md`（常時読込）に完全一致形へ修正。設置場所が reference 側のためテスト対象外ではあるがパス表記不統一を解消
  2. `AGENTS.md:117`: `ARCHITECTURE.md` に（常時読込）注記を付与（セッション開始時の確認は注入済み内容の参照なので注記が有効）。v1120test AGENTS.md:49 にも手動反映
  3. AGENTS.md:117 以外は ARCHITECTURE.md 参照は「編集対象」または「0-* 初期セットアップ」中のものであり、注記追加は不要と判断（編集時は Read が正当、初期セットアップはテンプレート全文の refile が目的）
- v1120test: code-review.md は setup 再実行で自動反映（SAME 確認済み）、AGENTS.md と ARCHITECTURE.md はプロジェクト固有版のため手動反映

## 次のセッションでやること
- 今回の変更（ファイル参照バッククォート＋フルパス統一 86ファイル）と、未コミットの naming/code-quality 常時化・API キャスト除去のコミット可否を人間に確認する（commit/push は人間の指示があるまで実行しない）

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