---
name: site-to-sample
description: Ports a single visual part ("block" in this repo's BEM/SCSS terms) from one specific page of an existing website into src/htdocs/samples/, following this repo's exact file layout and naming conventions. Use when the user asks things like "このサイトのヘッダーをsamplesに追加して", "このURLのパーツを取り込んでBEMブロック化して", "既存サイトのコーディングを参考にsamplesにブロックを追加して", or otherwise wants to port HTML/CSS/JS from an external page into this project's samples area. Only applicable within this repo (html5-skeleton) — it depends on the `src/htdocs/samples/` conventions documented in references/samples-conventions.md.
user-invocable: true
---

対象は外部サイトの**特定の1ページ**のみ（複数ページのクロールはしない）。「どのパーツを取り込むか」は事前にCSSセレクタを聞くのではなく、ページ構造の候補一覧を提示してユーザーと対話しながら1つに絞り込む。

取得は組み込みの `WebFetch` を使わない。`WebFetch` はHTMLをMarkdownに変換し要約モデルで処理するため、クラス名やCSSルールを正確に保持できない。代わりに `scripts/extract-part.mjs`（Playwrightでヘッドレスブラウザを起動し、DOM/CSSOMから直接抜き出す）を使う。

## 手順

### 1. URLを確認する

ユーザーから対象ページのURLを受け取る。パーツの指定が既に具体的（例:「ヘッダー」「料金表」）でも、次のステップで候補一覧を見せてから確定させる。

### 2. Playwrightの準備を確認する

`node -e "require.resolve('playwright')"` で解決できるか確認する。初回実行でブラウザ本体が無いというエラーが出た場合は `npx playwright install chromium` を実行してから再試行する。

### 3. 候補一覧を表示する（モード1）

```bash
node .Codex/skills/site-to-sample/scripts/extract-part.mjs "<URL>"
```

出力される候補（header/nav/footer、`<main>`直下の要素、`<section>`など）をそのままユーザーに提示し、「どれを取り込みますか？」と対話で確認する。ユーザーの指示が曖昧な場合や候補が複数該当しそうな場合は、ここで往復して1つのセレクタに絞り込む。

### 4. 対象パーツを抽出する（モード2）

対象セレクタが決まったら実行する:

```bash
node .Codex/skills/site-to-sample/scripts/extract-part.mjs "<URL>" "<選ばれたselector>"
```

`TARGET HTML`・`MATCHED CSS RULES`・`SCRIPTS`（フィルタなし全文）が出力される。JSは自動フィルタしていないので、対象パーツに関係する部分を自分で読んで判断する。

他サイトの意匠をそのまま複製するのではなく、構造・挙動を参考にこのプロジェクトの規約で再実装する、という前提でここから先の変換を行う。

### 5. ブロック名と配置先を決める

- 内容から英単語のブロック名を決める（例: `pricing`, `hero`）。
- `references/samples-conventions.md` の grep コマンドで既存の連番衝突をチェックし、次の空き番号 `_N` を採用する。
- 単一コンポーネントなら `module/`、他ブロックに付随する装飾/オーバーレイなら `extra/` を選ぶ（詳細は references 参照）。

### 6. 規約に沿って変換する

`references/samples-conventions.md` を読み、以下に従ってHTML/CSS/JSを書き起こす:
- EJSはdoctype無しの素のフラグメント、閉じタグ直後に `<!-- /.blockname_N -->`
- SCSSは規定の3行の `@use` + ドキュメントコメント + BEM（`&__element`、必要な場合のみ `$block: &;`）+ `.is_xxx` 状態クラス
- レスポンシブは `pc`/`sp` mixin・`px2vw1/2`・`clamp1`・`min1`・`max1`（無理に置き換えなくてよい）
- JSはフレームワーク依存コードをそのまま移植せず、見た目の挙動をvanilla JSで自己完結に再実装（既存の `_nav_1.js` スタイル）

既存の `header_1.ejs`/`_header.scss`/`_nav.scss`/`_nav_1.js`（`references/samples-conventions.md` に抜粋あり）を実例テンプレートとして使う。

### 7. ファイルを作成する

- `src/htdocs/samples/assets/html/<name>_<N>.ejs`
- `src/htdocs/samples/assets/css/module/_<name>_<N>.scss`（または `extra/`）
- `src/htdocs/samples/assets/js/components/_<name>_<N>.js`（挙動がある場合のみ）

### 8. アグリゲーターに登録する

- `src/htdocs/samples/assets/css/all.scss` に `@use "module/<name>_<N>";`（または `extra/...`）を追記。
- JSファイルを作った場合は `src/htdocs/samples/assets/js/all.js` に `import './components/_<name>_<N>';` を追記。
- `src/htdocs/samples/index.ejs` の `<main>` 内に `<!--#include virtual="/samples/assets/html/<name>_<N>.html" -->` を追記（既に同じ行があれば追記しない）。

`webpack.config.js` の編集は不要（globで自動検出される）。

### 9. 検証方法を案内する

`npm start` はwatchし続ける長時間コマンドなので代理実行せず、ユーザーに実行してもらうか、背景実行の許可を得てから実行する。案内する確認内容:
- `dist_uncompressed/htdocs/samples/assets/html/<name>_<N>.html` が素のフラグメントとして生成されているか
- `dist_uncompressed/htdocs/samples/index.html` にSSIコメントがそのまま残っているか（配信時解決のため正常）
- BrowserSyncで配信されたページの `/samples/index.html` を開き、見た目とJS挙動を確認
- `dist_uncompressed/htdocs/samples/assets/css/all.css` に新ブロックのルールが含まれているか
- `npm run validate:html` でエラーが増えていないか
- `assets/css/module/`（メインサイト側）との class名衝突が無いか

## 補足資料

- `references/samples-conventions.md` — ファイル配置・BEM命名・doc-comment雛形・import式・連番衝突チェックの詳細とコード例。
- `scripts/extract-part.mjs` — Playwrightで対象ページを開き、モード1（候補一覧）・モード2（HTML/CSS/JS抽出）を行うスクリプト。ファイルパス引数は取らず、標準出力にセクション区切りで書き出す。
