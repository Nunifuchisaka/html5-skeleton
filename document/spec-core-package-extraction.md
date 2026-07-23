# 仕様書：ビルド基盤の npm パッケージ化（`html5-skeleton-core`）

作成日: 2026-07-24
更新日: 2026-07-24（Codexレビュー反映）
ステータス: レビュー反映済みドラフト（v2）

## 1. 背景・目的

現状、新規静的サイト案件は `html5-skeleton` リポジトリを丸ごと複製して作成している（`html-skeleton-new` スキル）。この方式では、複製後に `html5-skeleton` 本体（ビルド基盤側）へ加えた改善・バグ修正を、既存の子プロジェクトへ自動的に反映できない。

本仕様は、Unity の Prefab Variant に近い体験——「親（ビルド基盤）の新しいバージョンを明示的に選ぶと、子プロジェクト側は差分（実際のページ・コンテンツ）を保ったまま更新を取り込める」——を、ビルド基盤部分に限定して実現することを目的とする。

更新は自動追従ではない。`html5-skeleton-core` に不変の semver タグを付け、子プロジェクトが参照タグと `package-lock.json` を明示的に更新して取り込む方式とする。

### 1.1 非目標（この仕様で解決しないこと）

- `_head.ejs` / `_header.ejs` / `_footer.ejs` などページ共通パーシャルや、`base/reset` 等のデザイン・マークアップの共有・自動反映は対象外とする。これらは案件ごとに変わる「コンテンツ」であり、子プロジェクトの `src/` に残る。
- Unity のプロパティ単位オーバーライドのような自動差分UIは実現しない。設定の上書きは明示的なオプション引数（後述）で行う。
- 既存の `html5-skeleton` リポジトリ自体を破棄・置換しない。本仕様は新たに切り出す `html5-skeleton-core` パッケージと、それを利用する形に作り替えた `html5-skeleton`（今後のテンプレート）の両方を扱う。
- 複製済みの既存案件を自動的に移行しない。既存案件の移行手順は別途仕様化する。

## 2. 現状構成（移行前）

実設定は `config/webpack.config.js` にあり、`package.json` の `start` は `webpack --config config/webpack.config.js` としてこのファイルを直接指定している。ルートに webpack 設定のラッパーは存在しない。

`config/webpack.config.js` は単一ファイルで以下を担う。

- 定数定義：`SRC_DIR` / `DIST_DIR` / `DIST_UNCOMPRESSED_DIR` / `CONTENT_TEXT_DIR`
- 画像最適化設定：`config/image-optimization.config.js` から `IMG_TO_WEBP_SRC_DIR` / `WEBP_QUALITY` を読み込む
- `loadContentData()`：`src/content/text/site.json` と `src/content/text/pages/**/*.json` を読み込み、`{SITE_NAME, SITE_URL, START_PATH, PAGES}` を構築する
- `getScssEntries()` / `createImageInlineRule()` / `createScssRule()`：エントリー探索・ルール生成のヘルパー
- 開発用設定：`dist_uncompressed/` 向けの `name: 'uncompressed'` 設定。SCSS→CSS、EJS→HTML のみを処理し、`STYLELINT` 環境変数によるオプトインの Stylelint 実行を含む
- production用設定：`dist/` 向けの `name: 'production'`, `dependencies: ['uncompressed']` 設定。JS/TS コンパイル、SCSS 圧縮、`CopyPlugin` による WebP 変換と `dist_uncompressed` から `dist` へのコピー・HTML圧縮、`BrowserSyncPlugin` と `browsersync-ssi` を含む
- `module.exports = [uncompressed設定, production設定]`

付随ファイルの実体は以下である。

- `config/babel.config.js`
- `config/postcss.config.js`
- `config/stylelint.config.js`
- `config/eslint.config.js`
- `config/image-optimization.config.js`
- `scripts/watch-webp.js`
- `src/htdocs/assets/css/tool/_index.scss`
- `.htmlvalidate.json` / `validate-html.js`

ルートの `babel.config.js` / `postcss.config.js` / `.stylelintrc.js` / `eslint.config.js` は、CLIやエディタ拡張による自動検出を維持するため、`config/` 配下の実設定を `require()` するラッパーである。

現行 `package.json` の `devDependencies` は41パッケージである。パッケージ化ではこれらを一括移動せず、coreの実行に必要な依存と、子プロジェクトの検証・案件運用に必要な依存に分ける。境界は3.1で定める。

### 2.1 前提条件（対応済み）

パッケージ切り出し前の現行リポジトリで、以下の2件は2026-07-24に対応済みである。

- Windows で `PAGES` キーが壊れる不具合：`glob.sync('pages/**/*.json', ...)` に `posix: true` を追加し、Windowsでも `pages/index.json` から `PAGES.index` を生成できるようにした。
- WebP 品質値の二重管理：webpack側の90と `scripts/watch-webp.js` 側の75を廃止し、共有モジュール `config/image-optimization.config.js` の `WEBP_QUALITY: 90` に統一した。パッケージ化時はこの共有設定とWebP変換の共通ロジックをcoreへ移し、webpack経路とwatch CLI経路の双方から利用する。

## 3. 移行後アーキテクチャ

### 3.1 パッケージ境界

| 領域 | 移行先 | 理由 |
| --- | --- | --- |
| `config/webpack.config.js` の中核ロジック | `html5-skeleton-core` | ビルドの仕組みそのものであり、案件ごとに変わらないため |
| `config/image-optimization.config.js` とWebP変換の共通ロジック | `html5-skeleton-core` | webpackとwatch CLIの品質値・変換処理を単一化するため |
| `src/htdocs/assets/css/tool/_index.scss` | 子プロジェクトに残す（v1） | フォント、サイト幅、余白、個別幅など案件固有値を含むため |
| Babel / PostCSS / Stylelint のデフォルト設定 | `html5-skeleton-core` から設定サブパスとして公開 | ビルド結果の基準を共通化するため |
| ESLint / HTML validation のデフォルト設定 | `html5-skeleton-core` から設定サブパスとして公開し、子側で上書き可能にする | CLI・エディタ連携を保ちながら共通の初期値を提供するため |
| coreが直接使う webpack / loader / plugin 等 | `html5-skeleton-core` の `dependencies` | coreの実行時依存であり、子側のhoistingに依存させないため |
| Playwright / TypeScript / 案件側ESLint運用等 | 子プロジェクトの `devDependencies` | テンプレートや案件の検証・開発運用に属するため |
| `src/htdocs/**` | 子プロジェクトに残す | ページ、コンポーネント、案件固有SCSS/JSという差分そのものであるため |
| `src/content/**` | 子プロジェクトに残す | サイト名、本文、画像など案件固有コンテンツであるため |
| `base/reset` / `base/font` / `base/foundation` / `base/javascript` / `state` | 子プロジェクトに残す | デザインの土台であり、案件ごとに調整されるため |
| `img2webp/` | ロジックはcore、フォルダは子プロジェクト直下 | 入出力パスを子側の `rootDir` 基準にするため |
| `samples/**` | 子プロジェクトに残す | デモ・プロトタイプであり、基盤ロジックではないため |
| ルート設定ラッパーと `config/webpack.config.js` | 子プロジェクトに残す | ツールの自動検出と現行の起動パスを維持するため |

現行41パッケージの振り分けは以下を基準とする。実装時にはcore内のすべての `require()`、loader、preset、pluginを再走査し、直接利用する依存が漏れていないことを確認する。

| 区分 | 現行パッケージ | 方針 |
| --- | --- | --- |
| coreの `dependencies` | `@babel/core`, `@babel/preset-env`, `@babel/preset-typescript`, `autoprefixer`, `babel-loader`, `browser-sync`, `browser-sync-webpack-plugin`, `browsersync-ssi`, `chokidar`, `copy-webpack-plugin`, `css-loader`, `ejs-plain-loader`, `glob`, `html-loader`, `html-minifier-terser`, `html-webpack-plugin`, `mini-css-extract-plugin`, `postcss`, `postcss-loader`, `postcss-sort-media-queries`, `resolve-url-loader`, `sass`, `sass-loader`, `sharp`, `stylelint`, `stylelint-config-standard-scss`, `stylelint-webpack-plugin`, `terser`, `terser-webpack-plugin`, `webpack`, `webpack-cli`, `webpack-remove-empty-scripts` | coreの設定、変換処理、watch CLIが直接使うためcoreで固定する |
| 子の `devDependencies` | `@types/jquery`, `eslint`, `eslint-webpack-plugin`, `globals`, `playwright`, `typescript`, `typescript-eslint`, `typescript-native` | 型チェック、ブラウザ検証、案件側lint運用として子で管理する |
| 提供形態で決定 | `html-validate` | coreがvalidator CLIを提供する場合はcore、現行の子スクリプトを維持する場合は子に置く。v1実装開始時にCLIの所有者を確定し、二重導入しない |

ESLint設定が利用するパッケージも、推移的依存に頼らず子側の直接依存または明示したpeer dependencyとして宣言する。

### 3.2 パッケージAPI設計

`html5-skeleton-core` はCommonJS関数を公開し、子プロジェクトの現行位置である `config/webpack.config.js` はこれを呼び出すだけの薄いラッパーにする。

```js
// 子プロジェクト側 config/webpack.config.js（全文）
const path = require('path');
const createConfig = require('html5-skeleton-core');

module.exports = createConfig({
  rootDir: path.resolve(__dirname, '..'),
  // 以下は省略時デフォルトあり。上書きしたい項目のみ指定する
  srcDir: './src',
  distDir: './dist',
  distUncompressedDir: './dist_uncompressed',
  contentTextDir: './src/content/text',
  imgToWebpSrcDir: './img2webp',
  webpQuality: 90,
  stylelint: process.env.STYLELINT === '1',
});
```

`rootDir` だけは省略不可の絶対パスとする。その他の基本オプションのデフォルト値はコード例のとおりとし、`createConfig(options)` は現行相当の `[uncompressed設定, production設定]` を返す。

頻出する拡張は、以下の用途別オプションを第一級APIとして提供する。

| オプション | デフォルト | 用途 |
| --- | --- | --- |
| `copyPatterns` | `[]` | 標準パターンの後、BrowserSyncより前に追加する `CopyPlugin` パターン |
| `plugins.uncompressed` | `[]` | uncompressed設定へ追加するプラグイン |
| `plugins.production` | `[]` | production設定へ追加するプラグイン |
| `sassOptions` | `{}` | 標準のSassオプションへ用途を限定して上書きする値 |
| `resolve.alias` | `{}` | uncompressed / production両設定のwebpack alias |
| `browserSync` | `{}` | 標準BrowserSync設定に対する上書き |
| `watchIgnored` | `[]` | 標準のwatch除外に追加するglobまたは正規表現 |
| `extendConfig` | 未指定 | 用途別オプションで表現できない場合の最終フック |

汎用deep mergeは標準APIにしない。拡張の決定と不変条件は4.1で定める。

### 3.3 配布方法

npm registryは新設せず、GitHubリポジトリへのgit依存として配布する。

```json
// 子プロジェクトの package.json
"devDependencies": {
  "html5-skeleton-core": "github:Nunifuchisaka/html5-skeleton-core#v1.0.0"
}
```

更新時は `html5-skeleton-core` 側で改修し、semverに従う新しい不変タグを付ける。子プロジェクトは参照タグを上げて `npm install` を実行し、更新された `package.json` と `package-lock.json` を同じ変更としてコミットする。親更新の自動反映は行わない。

### 3.4 リポジトリ構成

- 新規リポジトリ `html5-skeleton-core`
  - ビルド済みCommonJSの `dist/index.cjs`
  - Babel / PostCSS / Stylelint / ESLint / HTML validation の公開設定
  - 画像最適化の共有設定・変換ロジック・watch CLI
  - `package.json`、テスト、最小fixture
  - 将来SCSS公開APIを追加した場合の `scss/`
- 既存 `html5-skeleton`
  - `html5-skeleton-core` を `devDependencies` に持つテンプレート
  - 現行位置を踏襲した `config/webpack.config.js`
  - coreの設定サブパスを読み込むルート設定ラッパー
  - 案件固有の `src/**`、`src/content/**`、`img2webp/`
  - `html-skeleton-new` スキルによる複製フローは維持する

## 4. 決定事項

### 4.1 拡張ポイントの設計

**決定**

汎用deep mergeは採用しない。`copyPatterns`、`plugins.uncompressed`、`plugins.production`、`sassOptions`、`resolve.alias`、`browserSync`、`watchIgnored` を用途別の第一級APIとして提供する。これらで表現できない要件に限り、設定ごとに呼び出す最終手段のフックを提供する。

```js
extendConfig(config, context) {
  // context.name: 'uncompressed' | 'production'
  // context.paths: rootDirを基準に解決済みの絶対パス
  return config;
}
```

フックは設定オブジェクトを返す。フック実行後、coreは次の不変条件を再検証し、違反時は設定名と違反項目を含むエラーで停止する。

- `name` がそれぞれ `'uncompressed'` / `'production'` であること
- productionの `dependencies` が `['uncompressed']` であること
- `context` とすべての出力先が子プロジェクトの `rootDir` 基準であること
- `img2webp/**/*.webp` の標準watch除外が残っていること
- `CopyPlugin` と `BrowserSyncPlugin` が存在し、CopyPluginがBrowserSyncより前であること

**理由**

`plugins`、`module.rules`、`optimization.minimizer` などの配列は、連結・置換・重複排除の正解が用途ごとに異なる。汎用deep mergeはプラグインの二重登録や順序崩れを起こしやすい。頻出用途を明示的に扱い、例外だけをフックへ閉じ込める方が公開APIと不変条件を保ちやすい。

**実装時の検証項目**

- 各用途別オプションが標準設定を失わず追加・上書きされること
- `plugins.uncompressed` と `plugins.production` が他方へ混入しないこと
- `extendConfig` が各設定で1回だけ呼ばれ、`context.name` と `context.paths` が正しいこと
- フックで各不変条件を壊した場合に明確なエラーとなること
- フック内で利用者が任意に `webpack-merge` を使えること

### 4.2 `rootDir`・パス解決・`CONTENT_DATA`

**決定**

`rootDir` は省略不可の絶対パスとし、相対パスや未指定はエラーにする。`srcDir`、`distDir`、`distUncompressedDir`、`contentTextDir`、`imgToWebpSrcDir` など全パスオプションは、`createConfig()` の冒頭で一度だけ絶対パス化する。相対値は必ず子側の `rootDir` を基準にし、core側の `__dirname` や暗黙の `process.cwd()` は使わない。

`CONTENT_DATA` はモジュールトップで共有せず、`createConfig(options)` の呼び出しごとに解決済み `contentTextDir` から読み込む。`site.json` またはページJSONの不在・構文エラー、ページキー重複には対象ファイル名を含むエラーを出す。ページglobは `posix: true` を維持し、`PAGES` キーから `pages/` と `.json` を除く。

content JSONは設定生成時に一度だけ読み込む。「content JSONの変更をwatch中のビルドへ反映するには `npm start` の再起動が必要」であることをv1の公開仕様とする。

**理由**

workspaces、サブディレクトリからの実行、同一プロセスから複数プロジェクトの設定生成でも、パスとコンテンツがcoreの配置や先行呼び出しに影響されないようにするためである。また、JSONエラーの原因を利用者が対象ファイルまで追跡できる必要がある。

**実装時の検証項目**

- `rootDir` の未指定・相対パスを拒否すること
- 相対パスオプションと絶対パスオプションを正しく一度だけ解決すること
- 異なる2つの `rootDir` で連続して `createConfig()` を呼び、`CONTENT_DATA` が混ざらないこと
- Windows/Linuxで `PAGES.index` と多階層キーが同一になること
- JSON不在、構文エラー、ページキー重複のエラーに対象ファイル名が含まれること
- content JSON変更がプロセス再起動後に反映されること

### 4.3 `base/`、`samples/`、SCSS共有モジュール

**決定**

v1では `src/htdocs/assets/css/tool/_index.scss` をcoreへ移さず、子プロジェクトに残す。`base/**`、`state/**`、`samples/**` も従来どおり子側に残し、既存の相対 `@use "tool"` / `@use "../tool"` を維持する。

現行 `tool/_index.scss` は汎用mixinだけでなく、フォント、サイト幅、余白、個別幅など案件固有の値を含む。参照・利用箇所はsamplesを含め少なくとも33箇所あり、v1で直接参照を一括変更しない。

将来、SCSSの汎用部分を切り出す場合は次の構造とする。

1. coreには汎用関数・mixinのみを置き、設定可能な変数には `!default` を付ける。
2. 子側の `tool/_index.scss` をfacadeとして残し、案件固有変数を定義する。
3. facadeからcoreを `@forward` し、既存パーシャルからの相対 `@use` を維持する。
4. coreの参照は `@use "pkg:html5-skeleton-core/scss/tool"` とする。
5. `sassOptions.importers` に `new sass.NodePackageImporter(rootDir)` を登録し、coreの `package.json` の `exports` に `sass` 条件を定義する。

**理由**

`tool/_index.scss` はビルド基盤よりもデザイントークンに近く、coreへ固定すると案件差分を狭めるどころか設定値の上書きと広範な参照変更を強いる。将来のfacade方式なら、既存の子側importを維持したまま汎用部分だけを共有できる。

**実装時の検証項目**

- v1移行前後で既存SCSSの参照パスと生成CSSが変わらないこと
- `base/**` と `samples/**` を含む全SCSSがコンパイルできること
- 将来切り出す際はwebpackとSass CLIの双方で `pkg:` importが解決できること
- 将来のcore変数が `!default` で子側から設定でき、facade経由の公開メンバーが重複しないこと

### 4.4 `img2webp` のwatch除外

**決定**

標準watch除外globは、`path.resolve(rootDir, imgToWebpSrcDir)` で子側の画像ステージングディレクトリを絶対パス化し、`**/*.webp` を連結した後に `\` を `/` へ正規化して生成する。

```js
const imgToWebpPath = path.resolve(rootDir, imgToWebpSrcDir);
const ignoredWebp = path
  .join(imgToWebpPath, '**/*.webp')
  .replace(/\\/g, '/');
```

解決基準は必ず子側の `rootDir` とする。標準除外は `watchIgnored` で受け取ったユーザー除外と併存させ、ユーザーオプションや `extendConfig` で消去できない不変条件とする。

**理由**

Watchpackの監視対象は絶対パスで照合されるため、coreの `__dirname` 基準や単なる相対globでは一致しない可能性がある。また、生成された `.webp` を再検知すると再ビルドが連鎖するため、標準除外を常に保持する必要がある。

**実装時の検証項目**

- WindowsとLinuxの両方で除外できること
- `img2webp/a.webp` と多階層の `.webp` を除外できること
- `imgToWebpSrcDir` に絶対パスを指定しても正しく解決できること
- ユーザーの `watchIgnored` と標準除外が両方残ること
- WebP生成後にwebpackの再ビルドが発火しないこと

### 4.5 公開契約とsemver運用

**決定**

以下を `html5-skeleton-core` の公開契約とする。

- `createConfig()` のオプション名、型、デフォルト値、用途別マージ規則
- `src/` 配下の配置規約、対象glob、`_` で始まるパーシャルの除外規約
- `dist_uncompressed/` / `dist/` の出力先、出力ファイル名、asset配置
- `site.json` とページJSONの構造、POSIX区切りの `PAGES` キー
- coreが公開するSass変数・mixin・関数。v1では `tool/_index.scss` を子に残すため、coreのSass公開メンバーは設けない
- Babel / PostCSSによる変換結果
- 対応Node/npmバージョン
- `STYLELINT` など動作に影響する環境変数
- productionがuncompressedに依存する2パス構成
- 公開する設定サブパス、CLI、`package.json` の `exports`

バージョン運用は以下とする。

- patch：公開契約を変えない不具合修正
- minor：後方互換なオプション・機能・公開サブパスの追加
- major：glob、出力、デフォルト、必要なファイル構造、2パス構成、Sass公開メンバーの削除または意味変更など、子側の変更を要求する変更
- 公開済みタグの付け直しは禁止する
- `package.json` の `version`、Gitタグ、リリースノートを一致させる
- majorリリースには移行ガイドを必須とする
- 子プロジェクトは `package.json` と `package-lock.json` をコミットし、更新PRでビルド・出力差分を検証する

v1の対応環境はNode.js 22 LTSおよび24 LTS、npm 10以上とする。coreとテンプレート双方の `package.json` に同じ `engines` を定義し、CIの検証範囲と一致させる。

```json
"engines": {
  "node": "^22.0.0 || ^24.0.0",
  "npm": ">=10.0.0"
}
```

**理由**

このパッケージの破壊的変更はJavaScript APIだけでなく、規約ベースの入力、生成物、変換結果、環境にも現れる。契約範囲と更新方法を明示し、子側が参照タグとlockfileを選んで取り込むことで、意図しない自動更新を防ぐ。

**実装時の検証項目**

- 公開契約をREADMEと自動テストの双方で固定すること
- patch/minor/majorの各変更例をリリース手順へ記載すること
- タグ、version、リリースノートの不一致をCIで検出すること
- majorリリースに移行ガイドがない場合はリリースできないこと
- 子側のlockfileにGitタグが解決したコミットSHAが記録されること
- Node.js 22/24とnpm 10以上で同じfixtureが通ること

### 4.6 移行手順・ロールバック

**決定**

初回移行は以下の8段階で行う。

1. 現行 `html5-skeleton` に移行前のベースラインタグを付ける。
2. coreリポジトリへ現行ロジックを移植し、単体テストと最小fixtureを作る。
3. `npm pack` で生成したtarballをfixtureへインストールし、パッケージに同梱された内容だけでビルドできることを確認する。
4. Windows/Linuxと対応Node LTSの組み合わせで、ビルド、HTML検証、型チェック、SSI、WebP変換を確認する。
5. Git依存としてのインストールを別途検証し、成功後にcoreの `v1.0.0` タグを付ける。
6. `html5-skeleton` は移行ブランチでcore参照へ切り替え、`package.json` と `package-lock.json` を更新する。
7. `dist/` を削除せず、ベースラインと主要出力、BrowserSync、SSI、WebPの動作を比較する。
8. 移行に必要な変更をひとつの移行コミットとしてmasterへマージする。

初回移行のロールバックは、coreの参照タグを戻すだけでは行わない。設定ファイル、`package.json`、`package-lock.json` を含む移行コミット全体を `git revert` し、`npm ci` を実行して旧依存と旧設定を復元する。ロールバック手順はmasterへのマージ前に移行ブランチで実地確認する。

**理由**

tarballとGit依存ではinstall lifecycleや同梱内容が異なるため、両経路の検証が必要である。また、初回移行前にはcore依存自体が存在せず、タグ変更だけでは設定・lockfile・スクリプトを旧構成へ戻せない。

**実装時の検証項目**

- 8段階それぞれの実行記録と結果を移行PRへ残すこと
- tarball経由とGit依存経由の双方でクリーンインストールできること
- `dist/` と `dist_uncompressed/` の主要出力差分を説明できること
- 移行コミットのrevertと `npm ci` でベースラインのビルドへ戻れること

## 5. スコープ外・保留事項

- 複製済みの既存子プロジェクトを `html5-skeleton-core` 参照方式へ後から移行する手順は本仕様に含まない。必要であれば別途仕様化する。
- private npm registryの導入は行わない。Git依存の速度、監査、可用性が問題になった場合は別途検討する。
- v1におけるHTML validator CLIの所有者は、core実装開始時に決定する。いずれの選択でも設定サブパスの公開と子側からの上書きは維持する。
- WebP機能を完全に無効化するオプションはv1実装時に要否を判断する。少なくとも `sharp` の遅延読み込みと明確なエラーは必須とする。

## 6. 参考：現行実装

移行元の現行実装は `config/webpack.config.js`（コミット `5d45c4a` 時点＋本改訂と同日の不具合修正）を参照する。あわせて、共有済みの画像設定は `config/image-optimization.config.js`、watch CLIは `scripts/watch-webp.js` を参照する。仕様書へのソース全文添付は行わない。

## 7. 追加リスクと対策

### 7.1 高：loader・preset・pluginの間接依存解決

**リスク**

webpack設定内の `'babel-loader'`、`'css-loader'`、`'postcss-loader'` などの文字列は、core自身の `require()` ではなくwebpackのloader resolverが解決する。npmのhoistingや子側の依存構成に任せると、別バージョンを拾う、または非hoist構成で見つからない可能性がある。

**対策**

core内で `require.resolve('babel-loader')`、`require.resolve('css-loader')`、`require.resolve('postcss-loader')` などの絶対パスをwebpack設定へ埋め込む。Babel presetとPostCSS pluginも、coreの公開設定から確実に解決できるよう直接依存として宣言し、可能な範囲で `require.resolve()` を使う。fixtureは依存のhoistingを前提にしない構成でも実行する。

### 7.2 高：Git依存のinstall lifecycle

**リスク**

Git依存に `prepare`、`build`、`prepack`、`install` などがあると、npmが一時clone後に追加の依存インストールやビルドを行い、インストール時間と環境依存の失敗が増える。GitHubまたはGitへアクセスできないCI・端末では取得できない。

**対策**

coreはビルド済みCommonJSと、同梱対象となるSCSSをリポジトリへコミットし、`prepare` を置かない。`files` と `exports` で配布内容を限定する。利用環境にはGitとGitHubへのアクセスが必要であることを明記する。公開タグは不変とし、子側lockfileに記録されたコミットSHAを更新時に確認する。

### 7.3 高：Node/npmバージョン

**リスク**

現行のcore候補依存には、lockfile上でNode.jsの下限が異なるものがある。特に `sass@1.101.0` はNode.js 20.19.0以上、`glob@11.1.0` はNode.js 20または22以上を要求する。現行テンプレートの `package.json` には `engines` がなく、「webpack 5が動くNode.js」だけでは環境を特定できない。

**対策**

v1はNode.js 22 LTS / 24 LTS、npm 10以上を対応範囲とし、core・テンプレート双方の `package.json` に同じ `engines` を定義する。`.nvmrc`、Voltaまたは `devEngines` のいずれかで既定環境も揃え、CIマトリクスと公開仕様を一致させる。依存更新時は要求バージョンの変化を確認する。

### 7.4 高：`sharp` のネイティブ依存

**リスク**

`sharp` はOS、CPU、libcに応じたバイナリをoptional dependenciesから導入する。optional dependenciesの無効化や、単一環境だけで生成・更新したlockfileにより、別環境でWebP変換が失敗する可能性がある。

**対策**

- optional dependenciesを無効化しない。
- `sharp` はcoreのモジュールトップで読み込まず、WebP機能を実行した時点で遅延 `require()` する。
- 読み込み失敗時はOS・CPUと再インストール手順を含む明確なエラーを出す。
- Windows x64、macOS ARM64、Linux glibcでインストールとWebP変換を検証する。
- 複数環境で利用するlockfileの更新方法を運用手順へ明記する。

### 7.5 中：依存境界

**リスク**

現行41件の `devDependencies` を一括してcoreへ移すと、Playwright、TypeScript、型定義、案件側ESLint運用までcoreのリリースサイクルに結合する。一方、coreが直接実行するloaderやpluginを子側へ残すと、間接依存解決が不安定になる。

**対策**

3.1の振り分け表を初期境界とし、coreの実行に必要なものだけをcoreの `dependencies` に置く。テスト、型チェック、案件側lintは子の `devDependencies` に残す。`html-validate` はCLIの所有者と同じ側へ置く。子の `start` からcoreのwebpackを確実に起動できることを、非hoist構成を含むfixtureで検証する。

### 7.6 中：`main`・`exports`・`files` と同梱漏れ

**リスク**

JavaScript本体だけを配布対象にすると、公開設定、CLI、将来のSCSS、HTML validation設定などがGit依存またはtarballに入らず、ローカルリポジトリでは動くがインストール後に壊れる可能性がある。

**対策**

coreの `package.json` に `type: "commonjs"`、`main`、`exports`、`files` を明示する。`exports` には `.` のほか、Babel / PostCSS / Stylelint / ESLint / HTML validation の設定サブパス、画像設定、CLI、将来のSass公開パスを必要に応じて列挙する。`npm pack --dry-run` の内容確認と、生成tarballだけをインストールするfixtureテストをCIの必須項目にする。

### 7.7 中：周辺設定の自動検出

**リスク**

Babel、PostCSS、Stylelint、ESLint、HTML validationの実設定だけをcore内部へ移すと、子プロジェクトを起点に動くCLIやエディタ拡張が設定を自動検出できない。

**対策**

coreは各デフォルト設定を明示的なサブパスとしてexportする。子側は現行構造を踏襲し、ルートの `babel.config.js` / `postcss.config.js` / `.stylelintrc.js` / `eslint.config.js` とHTML validation設定からcoreのサブパスを `require()` する。案件固有の上書きが必要な場合は子側ラッパーで合成する。tarball fixtureとエディタを想定したCLI実行の双方で自動検出を確認する。

### 7.8 中：子側webpackラッパーの位置

**リスク**

core化に合わせてwebpackラッパーをルートへ移すと、現行の `package.json`、パス基準、利用者の操作手順に不要な差分が生じる。反対に、`config/webpack.config.js` から `rootDir: __dirname` を渡すと、プロジェクトルートではなく `config/` が基準になり出力先と探索先が壊れる。

**対策**

子側ラッパーは現行位置の `config/webpack.config.js` に残し、`rootDir: path.resolve(__dirname, '..')` を必須とする。`package.json` の `start` も `webpack --config config/webpack.config.js` を維持する。coreは絶対パスでない `rootDir` を拒否し、fixtureでサブディレクトリからの起動も検証する。
