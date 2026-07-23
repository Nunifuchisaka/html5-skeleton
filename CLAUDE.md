# CLAUDE.md

このファイルは、このリポジトリで作業する Claude Code (claude.ai/code) 向けのガイダンスを提供する。

## プロジェクト概要

Webpack 5 上に構築された静的サイト向けフロントエンドビルドスケルトン（EJS + SCSS + ES6 JS）。アプリケーションサーバーやテストスイートは存在せず、成果物は Web ホストにアップロードする静的な HTML/CSS/JS 一式（`dist/`）のみ。

## コマンド

```bash
npm install       # 依存パッケージのインストール
npm start         # `webpack` を実行：一度ビルドした後、src/ を監視しつつ dist/htdocs を BrowserSync で配信
npm run validate:html   # dist_uncompressed/htdocs/**/*.html に対して html-validate を実行
node validate-html.js   # 代替の HTML バリデータ：.htmlvalidate.json を使い、ファイルごとに行/列付きでエラーを表示
npm run type-check      # src/**/*.ts に対して tsc --noEmit を実行（実際に型チェックを行う唯一の手段。詳細は後述）
```

`package.json` にテスト用スクリプトや lint 用スクリプトは無い。Stylelint（`stylelint-webpack-plugin`、`fix: true` のため SCSS をその場で自動修正する）は `uncompressed` 設定に組み込まれているが、`STYLELINT` 環境変数が設定されている時のみ動作する — 素の `npm start` では実行されない（watch による再ビルドのたびに SCSS を再 lint・再修正してしまうため、通常の編集時はオフにしてある）。そのセッションだけ有効にしたい場合は `STYLELINT=1 npm start` を実行する。ESLintは必要に応じて`npx eslint src`で実行する。Babel・PostCSS・ESLint・Stylelintの実設定は`config/`にあり、各ツールの自動検出を維持するため、ルートの同名設定ファイルが実設定を読み込む。

`.ts` ファイルは `.js` と並行してサポートされている（`config/webpack.config.js` が `.ts` を `resolve` に含め、エントリー探索も `**/*.{js,ts}` で glob している）が、変換は `babel-loader` + `@babel/preset-typescript` によるもので、これは型を単に取り除くだけで型チェックは行わない。型エラーを検出できるのは `npm run type-check` だけであり、webpack のビルドは型エラーを含んだ JS でも問題なく出力してしまう。

開発中に単一ページだけをビルド・確認したい場合は、`npm start` を実行して `dist_uncompressed/htdocs/` 配下の該当ファイルを見ればよい。ファイル単位のビルドコマンドは存在しない。

## アーキテクチャ

### 2パス構成のマルチコンフィグビルド

`config/webpack.config.js` は**2つの設定を配列でエクスポート**しており、どちらも一度の `webpack` 呼び出しでビルドされる：

1. **`uncompressed`**（開発用設定）→ `dist_uncompressed/` に出力。SCSS → CSS と EJS → HTML のみをコンパイルする（JS は扱わない）。圧縮なし。
2. **`production`** → `dist/` に出力。JS（Babel + Terser）と SCSS → CSS（圧縮）を直接コンパイルするが、HTML など静的ファイルは `CopyPlugin` 経由で `dist_uncompressed/` から**コピー**しつつ HTML を圧縮する（`html-minifier-terser`）。

`production` は `dist_uncompressed` を読み込むため、`production` 設定側で `name: 'production'` と `dependencies: ['uncompressed']` を宣言し、Webpack の MultiCompiler が `uncompressed` を先にビルドするようにしている — これを外すと2つの設定がレースコンディションを起こしうるので削除しないこと。

`BrowserSyncPlugin`（`production` 設定に付随）が `dist/htdocs` を配信し、`browsersync-ssi` により SSI を注入する（詳細は後述）。

### エントリー探索は glob による規約ベースであり、手動列挙ではない

両設定とも `src/htdocs` に対して `glob.sync()` を使い、`entry` を自動的に構築する：
- `**/*.scss`（`_*.scss` を除く）→ ファイルごとに1つの CSS エントリー
- `**/*.{js,ts}`（`_*.js`/`_*.ts` を除く、production のみ）→ ファイルごとに1つの JS/TS エントリー
- `**/*.ejs`（`_*.ejs` を除く）→ ファイルごとに1つの `HtmlWebpackPlugin`

**ファイル名の規約**：先頭のアンダースコア（`_head.ejs`、`_reset.scss`、`_ignite.js`）は、他のファイルから `@use`/`include()`/`import` で取り込まれるだけのパーシャルであることを示し、それ自体が単独の出力としてビルドされることはない。アンダースコアの無いファイル（`base.scss`、`common.scss`、`index.ejs`、`common.js`）は単独のビルドエントリーとなる。新しいスタイルシート/スクリプトを追加するには、`src/htdocs` 配下に正しい命名規則のファイルを置くだけでよく、`config/webpack.config.js` への登録は不要。ただし新しい**ページ（EJS）**を追加する場合は、これに加えて `src/content/text/pages/` 配下に対応する content JSON も追加する必要がある（後述「コンテンツの分離」を参照）。

### SCSS 構造

`src/htdocs/assets/css/tool/_index.scss` は共有の変数・mixin・関数（ブレークポイント `$breakpoint1: 767px`、`pc`/`sp` mixin、`px2vw1/2`、`clamp1`、`min1`、`max1`）を保持し、`base.scss` と `common.scss` の両方の先頭で `@use "tool" as *` としてインポートされる。`base.scss` は `base/reset`、`base/font`、`base/foundation`、`base/javascript` に加えて `state`（`.is_pc_none_1`/`.is_sp_none_1`/`.is_none` などの PC/SP 表示切り替え用ユーティリティクラス）を集約する。`common.scss` は `module/`（コンポーネント単位のスタイル）、`layout/`、`extra/`、`animation/` の各パーシャルを集約する。

`createScssRule()` 内の `css-loader` の `url.filter` は、拡張子の前に `--pc`/`--sp`/`--exc` が付く画像 URL、および `/` から始まる画像 URL を意図的に書き換え対象から除外している — これらは webpack モジュールとして処理されず、リテラルなパスのまま残される。

### EJS/HTML の構成

各ページは共有パーシャル（`_head`、`_header`、`_footer`、`_body_before`、`_body_after`）を `include()` し、`ejs-plain-loader` により注入される `SITE_NAME`/`SITE_URL`/`START_PATH`/`PAGES`（後述「コンテンツの分離」を参照）を受け取る。これとは別に、`<!--#include virtual="..." -->` というコメントは EJS ではなく **SSI ディレクティブ**であり、ビルド時ではなく BrowserSync の `browsersync-ssi` ミドルウェアによって配信時に解決される。

### コンテンツの分離（`src/content/`）

テキスト（`src/content/text/`）と画像（`src/content/img/`）は `src/htdocs` から分離されたコンテンツ置き場で、実案件では商品画像・本文テキストなどをここに集約する運用を想定している。

- `src/content/text/site.json`：サイト全体のデータ（`SITE_NAME`/`SITE_URL`/`START_PATH`）。
- `src/content/text/pages/`：ページ単位の content JSON。ファイルパスは対応する EJS のパスと一致させる（例：`src/htdocs/samples/index.ejs` → `pages/samples/index.json`）。中身は `meta`（title/description 等）と、必要に応じて本文テキストを持つ最小限の構造でよい。
- `config/webpack.config.js`（`uncompressed` 設定側）がこれらを glob で一括読み込みし、`ejs-plain-loader` の `data` に `{SITE_NAME, SITE_URL, START_PATH, PAGES}` として注入する。`PAGES` はキーが上記のページパス（例：`PAGES.index`、`PAGES['samples/index']`）。EJS 側は `<%= SITE_NAME %>` や `<%= PAGES.index.meta.title %>` のような変数参照のみを行い、テキストを直書きしない。
- content JSON は webpack 設定の評価時に一度だけ読み込まれるため、編集を反映するには `npm start` の再起動が必要（EJS/SCSS/JS のような watch による自動反映はされない）。
- 画像は `src/content/img/` に置き、SCSS/EJS から相対パスで import する。ビルドパイプライン自体（`asset/inline` ルール）は従来の `src/htdocs/assets/img` と同じものをそのまま使う。
- `src/htdocs/samples/` は自己完結型のデモ/プロトタイプエリアという性質上、コンポーネントのダミー文言（`nav_1.ejs` のメガメニュー中身など）まではこの仕組みの対象にしていない。ロゴ表記など全ページ共通のサイト名表記のみ `SITE_NAME` 参照に置き換えている。

### 画像パイプライン（独立した2つの仕組み）

- `src/` 配下から参照され `asset/inline` ルールでインライン化される画像（jpg/png/webp/svg など、`img2webp` ディレクトリは除く）は CSS/JS に base64 でインライン化される。
- `img2webp/`（プロジェクトルート、`src/` の外）は別系統のステージングフォルダ：ここに置かれた `.jpg`/`.png`/`.jpeg` は `sharp` により `CopyPlugin` 経由で WebP に変換され、`img2webp/` 内に**その場で**書き戻される（`dist/` には出力されない）。ビルド自身が書き出した `.webp` ファイルによる監視・再ビルドの無限ループを避けるため、`webpackOptions.watchOptions.ignored` で `img2webp/**/*.webp` を明示的に除外している。`img2webp/` 内の変換済み `.webp`/元の `.jpg`/`.png` は gitignore 対象。

### サンプルエリア（`src/htdocs/samples/`）

メインサイトの `assets/css/{tool,module,extra}` 構造を、独自の `samples/assets/` ルート配下にミラーリングした自己完結型のデモ/プロトタイプエリアで、独自のアグリゲーター（`samples/assets/css/all.scss`、`common.scss` と同じ方法でインポートされる）を持つ。ここに置かれたファイルは通常のビルドエントリー規約に従う（`_` プレフィックスの無い `.ejs`/`.scss` は実際の webpack エントリーになる）。SCSS はブレークポイント/mixin を共有するためメインサイトの `tool/_index.scss` を `@use "../../../assets/css/tool" as *` でインポートしつつ、サンプル固有のデータ（例：`$contents` マップ）のために自身の `tool/_index.scss` も保持する。各ページは EJS の `include()` ではなく SSI（`<!--#include virtual="/samples/assets/html/*.html" -->`）で `index.ejs` に組み込まれる。`common.css` と同じページに読み込まれる独立したコンポーネント群であるため、`assets/css/module/` とのクラス名衝突に注意すること。

### デプロイ

`.vscode/sftp.json` が VSCode SFTP 拡張機能の設定として、`dist/`（コンテキスト：`dist`）をリモートの `staging`/`production` FTP プロファイルにアップロードするよう構成している（認証情報は空のプレースホルダーで、ローカル環境ごとに個別に埋める）。デプロイは npm スクリプトには含まれていない。
