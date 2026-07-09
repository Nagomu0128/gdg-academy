# handoff-mvp-integration — MVP 統合フェーズ以降の引き継ぎ指示書

> 読み込み側へ: まず「現在の状態」を実際のリポジトリ状態と突き合わせて検証してから着手すること(agent-handoff プロトコル)。

## 1. ゴール

docs/DesignDoc.md(v1.3)の MVP を worktree `C:\Users\kazuy\Projects\gdg-learning-wt-mvp`(ブランチ `feat/mvp`)で完成させ、**Sonnet 5 レビュー must-fix ゼロ + CI green の PR** を作って停止する(**merge は絶対にしない**)。

## 2. 現在の状態(2026-07-09 23:05 時点)

- ブランチ: `feat/mvp`(origin/Nagomu0128/learning へ push 済み)
- コミット: `d0319f8`(Layer0 契約)→ `22dcc0a`(Wave1: scaffold + lesson-kit + 教材32本 + DBスキーマ)→ `20b3482`(Wave2: 判定/認証/スライド/演習UI/進捗/インフラCI)
- **実装エージェント 14 体すべて status:done**。各自の担当範囲では typecheck / tests / lint green を実測報告済み。ただし**並行作業の合成結果としての全体 green は未確認**(これが統合フェーズの仕事)
- 判定パイプラインは実ブラウザで **/dev/validate PASS 32/32 実測済み**(B 報告)。dev-login は cookie 実測済み(C 報告)。E2E 5 本はスタブ相手に red(契約どおり)
- タスク管理: TaskList #4(統合)→ #5(Sonnet レビュー)→ #6(PR)が残
- オーケストレーション規約: サブエージェントは Workflow tool で fable + effort xhigh、529 死は model:opus リトライ。仕様は docs/specs/CONTRACTS.md(所有権マトリクス含む)と docs/specs/*.md

## 3. 残タスク(実行順)

### T1. オーケストレーター軽修正(他人の所有ファイルでも統合フェーズでは編集可)

1. **コース表示順**: content-meta.json の courses がディレクトリ名順(css→html→js)。学習順 HTML→CSS→JS にする。方法(推奨): `packages/lesson-kit/src/types.ts` の CourseDef に `order?: number` を追加 + `schemas.ts` の courseSchema に反映 + `content/courses/*/course.ts` に order(html=1, css=2, js=3)+ `app/scripts/codegen/lessons.ts` で order 昇順ソート(フォールバック slug 順)。
2. **root `pnpm test` が e2e(playwright)まで起動する問題**: ルート package.json の test を `pnpm -r --no-bail --filter '!@codesteps/e2e' run test` に変更(K の申し送り)。
3. **ADR 追記**(docs/DesignDoc.md §13): #16「total_passed はレッスン初合格時のみ +1(passed_10/50/100 = レッスン数の節目の意図。§9.2 の字義『合格提出ごと++』から変更)」。F 実装済み・仕様書側を追従させる。
4. CONTRACTS §6 の slides loader 戻り値に `courseTitle` を追記(D が additive に追加済み。ドキュメント同期のみ)。

### T2. 全体検証 green 化

```
pnpm install(念のため)→ pnpm codegen → pnpm typecheck → pnpm test → pnpm lint → pnpm validate:content
```

- すべて exit 0 にする。既知リスク: `tsconfig.node.json`(app)に DOM lib が無く、scripts/codegen が lesson-kit の DOM 型(types.ts の Document/Window)を取り込むと TS2304 → B は schemas の deep import で回避済みと報告しているが、**再発していたら tsconfig.node.json の lib に "DOM" を追加してよい**(凍結解除はオーケストレーター権限)。
- 失敗クラスタが大きければ修正エージェント(fable xhigh)を並列投入。小さければ直接修正。

### T3. 実ブラウザスモーク(chrome-devtools MCP)

1. `pnpm -F @codesteps/app db:migrate:local` 適用済み確認 → `pnpm dev`(port 5173, background)
2. `/dev/validate` → `[data-testid=validate-summary]` が **PASS 32/32**(初回に Vite の「504 Outdated Optimize Dep」が出たらリロード)
3. 学習フロー一気通貫: POST /api/dev-login → /courses → html-basics → html-01 slides(←→キー)→ 演習 → solution 入力 → できた! → クリア画面(streak 表示)→ /me(total-passed=1, badge first_pass)
4. 不合格パス・ヒント開放(2失敗で hint-1)・全角診断(＜ｈ１＞入力)も1件ずつ確認
5. 終了後サーバー kill

### T4. E2E green

- `pnpm e2e`。セレクタずれは `e2e/tests/selectors.ts` を **E の実装済み data-testid** に合わせる: editor / file-tab-{name} / run-button / submit-button / judge-message / preview-tab-{result|sample|console} / clear-screen / hint-{n} / show-solution(下部バーのみ)/ reset-button / solution-modal。F 側: cta-start / course-card-{slug} / lesson-item-{slug} / lesson-exercise-link-{slug} / resume-button / total-passed / streak-current / badge-{id}。
- 注意: `pnpm e2e --list`(`--` を挟まない)。webServer は e2e 設定が起動する。

### T5. Sonnet 5 レビューループ(worktree-ship フェーズ3)

- Agent tool(subagent_type: general-purpose, **model: sonnet**)に `git diff main...HEAD` のレビューを依頼(観点: バグ/エッジケース/セキュリティ(§10.2 チェックリスト)/規約違反/テスト不足。must-fix と nice-to-have を区別、修正はさせない)
- must-fix を修正(必要なら fable xhigh へ分割)→ 再レビュー → **must-fix ゼロまでループ**。nice-to-have は PR body へ
- 修正のたび commit & push(attribution 禁止)

### T6. PR 作成と CI green

- `gh pr create --base main --title "feat: MVP実装(学習コア・進捗・ゲーミフィケーション・インフラ)" --body <概要/変更点/テスト結果/モック一覧>`(**attribution フッター禁止**)
- `gh pr checks <番号> --watch` → 失敗は修正 → push → 再 watch、**全 green までループ**。CI の secrets 未設定スキップ(wrangler upload / deploy)は green 扱いで正常
- **merge しない。** green になったら停止

### T7. 最終報告 + 後片付け

- 報告に含める: PR URL / 変更概要 / レビューで直した点 / CI 結果 / **手動セットアップが必要なモック一覧**(①Google OAuth 実クレデンシャル(.dev.vars / wrangler secret)②Terraform apply + D1/KV 実 ID の wrangler.jsonc 転記 ③GitHub Actions secrets(CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)④wrangler.jsonc の env.production ブロック ⑤本番 BETTER_AUTH_SECRET。詳細 docs/RUNBOOK.md)
- `~/.claude/projects/C--Users-kazuy-Projects-gdg-learning/memory/mvp-build-session.md` を「レビュー・PR 完了」状態に更新
- **全タスク完了を検証したら、この指示書と docs/specs/HANDOFF.md を削除して commit**(部分完了なら削除せず、完了分に取り消し線+日時)

## 4. 制約・注意

- **merge 禁止 / ベースブランチ直接開発禁止 / Claude attribution 禁止 / テストの skip・緩和禁止**(グローバル CLAUDE.md + worktree-ship)
- 対話認証コマンド(gcloud auth login 等)は実行しない。gh は認証済み
- 凍結ファイル(CONTRACTS §9)の編集権限は統合フェーズのオーケストレーターにある(エージェントに任せる場合は明示的に許可を出す)
- サブエージェント: Workflow tool、fable + effort:"xhigh"、死んだら model:"opus" で再試行。dev サーバーのポートは 5173(統合)/ 5183-5188(エージェント個別)
- Windows: `python` は壊れている(`py` を使う)。PowerShell 5.1 に `&&` は無い(Bash tool 推奨)
- 教材(content/)の編集は本文バグ修正のみ。slug は不変

## 5. 完了後の処理

全タスク(T1〜T7)完了を検証したら、この指示書を削除して commit すること。
