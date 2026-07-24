# html5-skeleton-core

html5-skeleton（EJS + SCSS + ES6/TS の静的サイトビルドスケルトン）のビルド基盤を切り出した共有パッケージ。
仕様の正典は html5-skeleton リポジトリの `document/spec-core-package-extraction.md`。

## 使い方

子プロジェクトの `config/webpack.config.js`：

```js
const path = require('path');
const createConfig = require('html5-skeleton-core');

module.exports = createConfig({
  rootDir: path.resolve(__dirname, '..'), // 必須・絶対パス
});
```

`createConfig(options)` は `[uncompressed設定, production設定]` を返す。
`rootDir` 以外は省略可能で、デフォルトは以下のとおり。

| オプション | デフォルト | 説明 |
| --- | --- | --- |
| `srcDir` | `./src` | ソースディレクトリ |
| `distDir` | `./dist` | 本番出力先 |
| `distUncompressedDir` | `./dist_uncompressed` | 非圧縮出力先 |
| `contentTextDir` | `./src/content/text` | content JSON置き場 |
| `imgToWebpSrcDir` | `./img2webp` | WebP変換ステージング |
| `webpQuality` | `90` | WebP品質 |
| `stylelint` | `process.env.STYLELINT === '1'` | StylelintPluginの有効化 |

相対パスはすべて `rootDir` 基準で解決される。

### 拡張オプション（用途別・第一級API）

| オプション | デフォルト | 用途 |
| --- | --- | --- |
| `copyPatterns` | `[]` | 標準パターンの後、BrowserSyncより前に追加する `CopyPlugin` パターン |
| `plugins.uncompressed` | `[]` | uncompressed設定へ追加するプラグイン |
| `plugins.production` | `[]` | production設定へ追加するプラグイン |
| `sassOptions` | `{}` | 標準のSassオプションへの限定的上書き |
| `resolve.alias` | `{}` | 両設定のwebpack alias |
| `browserSync` | `{}` | 標準BrowserSync設定に対する上書き |
| `watchIgnored` | `[]` | 標準のwatch除外に追加するglob |
| `extendConfig(config, context)` | 未指定 | 最終フック。`context.name`（設定名）と `context.paths`（解決済み絶対パス）を受け取り、設定を返す |

汎用deep mergeは提供しない。`extendConfig` 実行後、以下の不変条件が再検証され、違反時は設定名を含むエラーで停止する：

- `name` が `'uncompressed'` / `'production'` であること
- productionの `dependencies` が `['uncompressed']` であること（2パスビルドの順序保証）
- `context` と出力先が `rootDir` 基準であること
- `img2webp/**/*.webp` の標準watch除外が残っていること（再ビルド連鎖の防止）
- `CopyPlugin` と `BrowserSyncPlugin` が存在し、CopyPluginが前であること

## 設定サブパス

CLI・エディタ拡張の自動検出を保つため、子プロジェクトのルートラッパーから以下を `require()` する。

| サブパス | 内容 |
| --- | --- |
| `html5-skeleton-core/babel` | Babel設定（preset-env + preset-typescript） |
| `html5-skeleton-core/postcss` | PostCSS設定（autoprefixer + sort-media-queries desktop-first） |
| `html5-skeleton-core/stylelint` | Stylelint設定（standard-scss + 緩和ルール） |
| `html5-skeleton-core/eslint` | ESLint flat config（要peer: eslint / typescript-eslint / globals / @eslint/js） |
| `html5-skeleton-core/htmlvalidate` | html-validate設定（JSON） |
| `html5-skeleton-core/image-optimization` | WebP変換の共有設定（`IMG_TO_WEBP_SRC_DIR` / `WEBP_QUALITY`） |
| `html5-skeleton-core/webp` | WebP変換ロジック（`convertBuffer` / `convertFile`。sharpは遅延ロード） |
| `html5-skeleton-core/watch-webp` | WebP watchの関数API（`startWatchWebp`） |

CLI: `html5-skeleton-webp`（`bin/watch-webp.js`）。カレントディレクトリの `img2webp/` を監視する。

## 公開契約（semver対象）

- `createConfig()` のオプション名・型・デフォルト値・用途別マージ規則
- `src/` 配下の配置規約（対象glob、`_` プレフィックスのパーシャル除外）
- `dist_uncompressed/` / `dist/` の出力先・出力ファイル名・asset配置
- `site.json` とページJSONの構造、POSIX区切りの `PAGES` キー
- Babel / PostCSSによる変換結果
- 対応Node/npm（`engines`: Node 22/24 LTS、npm 10以上）
- `STYLELINT` 環境変数
- productionがuncompressedに依存する2パス構成
- 公開する設定サブパス・CLI・`exports`

v1では Sass の公開メンバーは設けない（`tool/_index.scss` は子プロジェクト側）。

### バージョン運用

- patch: 公開契約を変えない不具合修正 / minor: 後方互換な追加 / major: 子側の変更を要求する変更
- 公開済みタグの付け直し禁止。`version`・Gitタグ・リリースノートを一致させる
- majorリリースには移行ガイド必須

## 制約・既知の仕様

- content JSONは設定生成時に一度だけ読み込む。watch中の編集反映には `npm start` の再起動が必要（v1の公開仕様）
- sharpは変換実行時に遅延ロードされる。読み込み失敗時は環境情報と再インストール手順を含むエラーを出す
- 配布はGitHubリポジトリへのgit依存（`github:Nunifuchisaka/html5-skeleton-core#v1.x.x`）。`prepare` 等のlifecycleスクリプトは置かない
