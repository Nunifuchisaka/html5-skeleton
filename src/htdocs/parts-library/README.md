# HTML5パーツ集

よく使うEJS / SCSS / JavaScriptのパーツを、案件へコピーして使うための保管場所です。

このディレクトリは雛形そのものではなく、案件ごとに必要な部品だけを取り出すための倉庫として扱います。将来的に別リポジトリへ切り出す場合も、この `parts-library/` をそのまま移動できます。

## 使い方

1. `parts/` または `layouts/` から使いたいパーツを選ぶ
2. パーツ内の `README.md` で依存関係と配置先を確認する
3. EJS / SCSS / JSを案件側の対応するディレクトリへコピーする
4. 案件側の `common.scss` や `common.js` から読み込む
5. `npm start` で表示と動作を確認する

## ディレクトリ構成

```txt
parts-library/
├─ parts/      # 単体コンポーネント
├─ layouts/    # ページやセクション単位の大きめパーツ
├─ snippets/   # meta、SSI、構造化データなどの短い断片
└─ recipes/    # 複数パーツの組み合わせ方
```

## パーツの基本ルール

- パーツ名ごとにディレクトリを分ける
- EJS / SCSS / JSは同じディレクトリにまとめる
- ファイル名は案件側でpartial扱いしやすいように `_parts-name.ext` にする
- パーツ単体の説明、配置先、読み込み例は各 `README.md` に書く
- 案件へコピーした後の調整を前提に、汎用化しすぎない

## 命名例

```txt
parts/accordion/
├─ README.md
├─ _accordion.ejs
├─ _accordion.scss
└─ _accordion.js
```

## 案件側への配置例

```txt
src/htdocs/assets/html/parts/_accordion.ejs
src/htdocs/assets/css/module/_accordion.scss
src/htdocs/assets/js/components/_accordion.js
```

