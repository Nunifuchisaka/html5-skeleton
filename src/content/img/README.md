# src/content/img

実案件の画像（商品画像・写真など）はこのディレクトリに置く。用途で `inline/` と `static/` を使い分ける。

## inline/ — base64インライン埋め込み用

- SCSS/EJS から相対パスで import して使う画像を置く（例: `url("../../../../content/img/inline/xxx.webp")`）。
- ビルドパイプラインは `src/htdocs/assets/img` からの画像 import と同じ `asset/inline` ルールをそのまま通し、CSS/JS に base64 で埋め込まれる。
- ここに置いただけでは何も出力されない。必ずどこかから import して使う。

## static/ — そのままコピー配信用

- `static/` 配下のディレクトリ構造を `htdocs/` 直下へミラーして、そのままファイルコピーで配信する画像を置く。
  - 例: `static/img/photo1.webp` → `dist_uncompressed/htdocs/img/photo1.webp` → `dist/htdocs/img/photo1.webp`
  - 例: `static/samples/assets/img/xxx.webp` → `htdocs/samples/assets/img/xxx.webp`
- `<img src>` などから URL 参照する画像（base64 化したくない大きな写真等）はこちらに置く。
- コピーは html5-skeleton-core の uncompressed 設定（CopyPlugin）が行い、production 側の dist_uncompressed → dist コピーで `dist/` にも流れる。

## 共通

- `dist`/`dist_uncompressed` に出力された実体は最終成果物であり、ソースの実体は必ずここに置く（dist 直置きはしない）。
