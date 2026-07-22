# src/content/img

実案件の画像（商品画像・写真など）はこのディレクトリに置く。

- SCSS/EJS からはこのディレクトリを基点に相対パスで import する（例: `url("../../../content/img/xxx.jpg")`）。
- ビルドパイプラインは `src/htdocs/assets/img` からの画像 import と同じ `asset/inline` ルールをそのまま通す。
- `dist`/`dist_uncompressed` に出力された実体は最終成果物であり、ソースの実体はここに置く。
