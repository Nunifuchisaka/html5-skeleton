 # HTML5開発スケルトン

このプロジェクトは、モダンな開発ツールを使用した静的Webサイトのフロントエンド開発環境です。
EJS、SCSS、ES6+ JavaScriptを利用して効率的に開発を進め、本番公開用に最適化されたファイルを生成します。

---

## ✨ 主な機能

*   **ビルドツール**: Webpack 5 を中心に構築されています。
*   **JavaScript**:
    *   BabelによるES6+のトランスパイルに対応。
    *   `node_modules` からインポートしたライブラリは `vendor.js` として分割出力。
    *   本番ビルド時にはTerserでコードを圧縮。
*   **CSS**:
    *   Sass (SCSS) をCSSにコンパイル。
    *   PostCSSによるベンダープレフィックスの自動付与。
    *   本番ビルド時にはコードを圧縮。
*   **HTML**:
    *   EJSテンプレートエンジンを利用して、HTMLの共通パーツ化やデータの埋め込みが可能。
*   **画像最適化**:
    *   `img2webp` ディレクトリに置かれたJPG/PNG画像を、より軽量なWebP形式に自動変換。
*   **開発サーバー**:
    *   BrowserSyncによるローカルサーバー機能。
    *   ファイルの変更を監視し、ブラウザを自動でリロード。
    *   SSI (Server Side Includes) にも対応。
*   **コード品質**:
    *   ESLintとStylelintを導入し、コードの品質と一貫性を維持。

## 📂 ディレクトリ構成

```
├── dist/                   # 本番公開用の圧縮ファイル
├── dist_uncompressed/      # 変更差分確認用の非圧縮ファイル
├── img2webp/               # WebPに変換したい画像を配置
├── node_modules/
├── src/                    # ソースファイル
├── packages/
│   └── html5-skeleton-core/  # ビルド基盤パッケージ（webpack設定生成・各ツール既定設定・WebP変換）
├── config/                 # coreを読み込む薄いラッパー（案件固有の上書きはここで合成）
│   ├── babel.config.js
│   ├── eslint.config.js
│   ├── postcss.config.js
│   ├── stylelint.config.js
│   └── webpack.config.js
├── .stylelintrc.js         # config/への自動検出用エントリー
├── babel.config.js         # config/への自動検出用エントリー
├── eslint.config.js        # config/への自動検出用エントリー
├── package.json
└── postcss.config.js       # config/への自動検出用エントリー
```

*   **ドキュメントルート**: `dist/htdocs`

## 🚀 使い方

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 開発・ビルド

以下のコマンドを実行すると、`src` ディレクトリ内のファイル変更を監視し、開発サーバーが起動します。
ファイルが変更されると、`dist` ディレクトリに本番用のファイルが自動的に生成され、ブラウザがリロードされます。

```bash
npm start
```

### 3. HTMLの構文チェック

HTMLファイルの構文をチェックします。

```bash
npm run validate:html
```
