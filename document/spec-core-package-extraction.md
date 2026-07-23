# 仕様書：ビルド基盤の npm パッケージ化（`html5-skeleton-core`）

作成日: 2026-07-24
ステータス: ドラフト（Codexレビュー前）

## 1. 背景・目的

現状、新規静的サイト案件は `html5-skeleton` リポジトリを丸ごと複製して作成している（`html-skeleton-new` スキル）。この方式では、複製後に `html5-skeleton` 本体（ビルド基盤側）に加えた改善・バグ修正が、既存の子プロジェクトへ自動的には反映されない。

本仕様は、Unity の Prefab Variant に近い体験——「親（ビルド基盤）を更新すると、子プロジェクト側は差分（実際のページ・コンテンツ）を保ったまま更新を取り込める」——を、ビルド基盤部分に限定して実現することを目的とする。

### 1.1 非目標（この仕様で解決しないこと）

- `_head.ejs` / `_header.ejs` / `_footer.ejs` などページ共通パーシャルや、`base/reset` 等のデザイン・マークアップの共有・自動反映は対象外。これらは案件ごとに変わる「コンテンツ」であり、子プロジェクトの `src/` に残る。
- Unity のプロパティ単位オーバーライドのような自動差分UIは実現しない。設定の上書きは明示的なオプション引数（後述）で行う。
- 既存の `html5-skeleton` リポジトリ自体を破棄・置換することはしない。本仕様は新たに切り出す `html5-skeleton-core` パッケージと、それを利用する形に作り替えた `html5-skeleton`（今後のテンプレート）の両方を扱う。

## 2. 現状構成（移行前）

`webpack.config.js`（リポジトリ直下、10,324 bytes）が単一ファイルで以下を担う。

- 定数定義：`SRC_DIR`/`DIST_DIR`/`DIST_UNCOMPRESSED_DIR`/`CONTENT_TEXT_DIR`、`IMAGE_OPTIMIZATION_CONFIG`（`IMG_TO_WEBP_SRC_DIR`/`WEBP_QUALITY`）
- `loadContentData()`：`src/content/text/site.json` と `src/content/text/pages/**/*.json` を読み込み、`{SITE_NAME, SITE_URL, START_PATH, PAGES}` を構築（評価時に一度だけ実行）
- `getScssEntries()` / `createImageInlineRule()` / `createScssRule()`：エントリー探索・ルール生成のヘルパー
- `createConfig_development()`：`dist_uncompressed/` 向け設定（`name: 'uncompressed'`）。SCSS→CSS、EJS→HTML のみ。`STYLELINT` 環境変数でオプトインの Stylelint 実行を含む
- `createConfig_production()`：`dist/` 向け設定（`name: 'production'`, `dependencies: ['uncompressed']`）。JS/TS コンパイル、SCSS 圧縮、`CopyPlugin`（img2webp の sharp 変換 + `dist_uncompressed` → `dist` コピー + HTML圧縮）、`BrowserSyncPlugin` + `browsersync-ssi`
- `module.exports = [uncompressed設定, production設定]`

付随ファイル：
- `src/htdocs/assets/css/tool/_index.scss`（共有 SCSS 変数・mixin・関数）
- `.htmlvalidate.json` / `validate-html.js`
- `babel.config.js` / `postcss.config.js` / `.stylelintrc.js`
- `package.json` の `devDependencies` 一式（webpack/babel/terser/sass 等、約30パッケージ）

## 3. 移行後アーキテクチャ

### 3.1 パッケージ境界

| 領域 | 移行先 | 理由 |
| --- | --- | --- |
| `webpack.config.js` の中核ロジック（上記すべて） | `html5-skeleton-core`（新設パッケージ） | ビルドの仕組みそのもの。案件ごとに変わらない |
| `tool/_index.scss` | `html5-skeleton-core`（SCSSモジュールとして同梱） | ブレークポイント・mixin は全案件共通の合意事項 |
| `.htmlvalidate.json` のデフォルト値 | `html5-skeleton-core` にデフォルトを内包し、子側で上書き可能に | バリデーションルールの基準は共通化したい |
| webpack/babel/terser 等の devDependencies | `html5-skeleton-core` の `dependencies`（子からは間接依存） | バージョン統率を親側に一元化 |
| `src/htdocs/**`（ページ・コンポーネント・案件固有SCSS/JS） | 子プロジェクトに残す | 案件ごとの差分そのもの |
| `src/content/`（サイト名・本文・画像） | 子プロジェクトに残す | 同上 |
| `base/reset` `base/font` `base/foundation` `base/javascript` `state` | 子プロジェクトに残す（判断論点、4.3参照） | デザインの土台だが案件で調整されることがある |
| `img2webp/` ステージングフォルダ運用 | ロジックは `html5-skeleton-core` に、フォルダ自体は各子プロジェクト直下 | パスは子側のプロジェクトルート基準のため |
| `samples/` エリア一式 | 子プロジェクトに残す（テンプレート初期値として提供） | デモ/プロトタイプであり基盤ロジックではない |

### 3.2 パッケージAPI設計（案）

`html5-skeleton-core` は関数をデフォルトエクスポートし、子プロジェクトの `webpack.config.js` はこれを呼び出すだけの薄いラッパーにする。

```js
// 子プロジェクト側 webpack.config.js（全文）
const createConfig = require('html5-skeleton-core');

module.exports = createConfig({
  rootDir: __dirname,
  // 以下は省略時デフォルトあり。上書きしたい項目のみ指定する
  srcDir: './src',
  distDir: './dist',
  distUncompressedDir: './dist_uncompressed',
  imgToWebpSrcDir: './img2webp',
  webpQuality: 90,
  stylelint: process.env.STYLELINT === '1',
});
```

`createConfig(options)` の内部で現行の `createConfig_development` / `createConfig_production` 相当を組み立て、`[uncompressed設定, production設定]` の配列を返す。`options` は全項目にデフォルト値を持たせ、子プロジェクトは差分だけを渡す（＝ Prefab Variant の「オーバーライドしたプロパティだけ持つ」感覚に対応）。

未確定論点：拡張ポイントの粒度。例えば子プロジェクト固有のwebpackプラグインを追加したい場合にどう差し込むか（`extendConfig(config) => config` のようなフック関数を options に渡す方式を想定）は 4.1 で扱う。

### 3.3 配布方法

npm registry を新設せず、GitHub リポジトリへの git 依存として配布する。

```json
// 子プロジェクトの package.json
"devDependencies": {
  "html5-skeleton-core": "github:Nunifuchisaka/html5-skeleton-core#v1.0.0"
}
```

更新時は `html5-skeleton-core` 側で改修 → タグ（semver）を打つ → 子プロジェクトで参照タグを上げて `npm install`。

### 3.4 リポジトリ構成（案）

- 新規リポジトリ `html5-skeleton-core`：`index.js`（createConfig本体）、`scss/_index.scss`、`config-defaults/.htmlvalidate.json` 等、`package.json`
- 既存 `html5-skeleton` リポジトリ：`html5-skeleton-core` を devDependency とする「テンプレート」として存続。`html-skeleton-new` スキルはこのリポジトリを複製する現行フローを維持（複製した瞬間に `html5-skeleton-core` への依存を持った状態でスタートする）

## 4. 論点（Codexレビューで特に見てほしい点）

### 4.1 拡張ポイントの設計
子プロジェクト固有の要件（例：特定案件だけ追加のCopyPluginパターンが要る等）が発生した場合の差し込み方式が未確定。`options.extendConfig` フック案の妥当性、あるいは他の設計（configをdeep mergeする方式等）の是非を検討してほしい。

### 4.2 `CONTENT_DATA` の読み込みタイミング
現行実装は webpack 設定評価時（プロセス起動時）に一度だけ `site.json`/`pages/**/*.json` を読む。パッケージ化後も子プロジェクトの `src/content/text` を `rootDir` 経由で参照する必要があり、パス解決がパッケージ内部からでも正しく行われるか（`path.resolve(options.rootDir, ...)` 基準で統一する想定）を確認したい。

### 4.3 `base/` 一式・`samples/` の扱い
3.1で「子プロジェクトに残す」としたが、`base/reset`や`tool/_index.scss`との依存関係（`base.scss`/`common.scss`が`@use "tool" as *`する構造）を考えると、`tool/_index.scss`だけパッケージ側に切り出すと子プロジェクト側の`@use`パスが変わる。現行の`@use "tool" as *`という相対importの書き方を、パッケージ化後にどう書き換えるべきか（`@use "html5-skeleton-core/scss/tool" as *` のようなnode_modules経由のimportで足りるか）を検討してほしい。

### 4.4 `img2webp` の無限ループ回避策の移植
現行は `watchOptions.ignored` に `img2webp/**/*.webp` を明示除外することで、ビルド自身が書き出したwebpによる再ビルドの無限ループを防いでいる。パッケージ化後も `options.imgToWebpSrcDir` を子プロジェクトのパスとして正しく `watchOptions.ignored` に反映できるか確認したい。

### 4.5 バージョン更新時の破壊的変更ハンドリング
`html5-skeleton-core` のマイナー/メジャーバージョンアップで、子プロジェクト側の `src/` 構成に影響するような変更（例：エントリー探索の glob パターン変更）が入った場合、子プロジェクト側で何が壊れるかを事前に検知する手段がない。semver運用のルール（例：`src/`配下のファイル配置規約を変えるのは必ずメジャーバージョンアップとする、等）を明文化すべきか検討してほしい。

### 4.6 移行手順・ロールバック
既存の `html5-skeleton` リポジトリを直接書き換える形になるため、移行中に `npm start` が壊れた状態が一時的に生じうる。安全な移行手順（例：`html5-skeleton-core` を先に完成・タグ付けし、`html5-skeleton` 側は新ブランチで移行してから通常運用のmasterへマージする等）を検討してほしい。

## 5. スコープ外・保留事項

- 既存の子プロジェクト（複製済みの案件）を `html5-skeleton-core` 参照方式へ後から移行する手順は本仕様に含まない。必要であれば別途仕様化する。
- private npm registry の導入は行わない（git依存で十分と判断）。将来的に必要になった場合は別途検討する。

## 6. 参考：現行 `webpack.config.js` 全文

レビュー時の突き合わせ用に、移行前の実装をそのまま添付する（`/Users/y_kanayama/projects/html5-skeleton/webpack.config.js` と同一）。
