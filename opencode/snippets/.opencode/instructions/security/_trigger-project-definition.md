### `docs/project-definition.md` が作成・更新されたとき

1. `.opencode/standards/principles/project-definition-guide.md` を読み、
   人間と対話しながら `docs/project-definition.md` の内容を確定する：
   - 初回作成：ガイド内のプロンプトに従い全セクションを埋める
   - 更新時：変更したい内容をヒアリングして各セクションを更新する。
     1つのセクションの変更が他セクションに波及しないか確認し、
     影響があれば合わせて更新する
     （例：Who が「自分のみ」→「公開」なら Security Constraint に影響、
       What の追加なら Risk Assessment/DoD に影響）
2. 内容が確定したら `.opencode/standards/principles/security-requirements.md` の
   「タイミング1」の手順に従う
3. 更新時のみ、以下のファイルに矛盾がないか確認する：
   - `docs/project-definition.md`
   - `ARCHITECTURE.md`
   - `AGENTS.md`
   - `DESIGN.md`（存在する場合のみ）
   全ファイルを読み込み内容を比較し、矛盾があれば人間に報告してから修正する
