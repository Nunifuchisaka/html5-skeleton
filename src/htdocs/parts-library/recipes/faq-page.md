# FAQページ

FAQページを作るときの基本手順です。

## 使うパーツ

- `parts/accordion/`
- `snippets/json-ld/` にFAQPageの構造化データを追加予定

## 実装手順

1. `_accordion.ejs` を案件側の `assets/html/parts/` へコピーする
2. `_accordion.scss` を `assets/css/module/` へコピーする
3. `_accordion.js` を `assets/js/components/` へコピーする
4. `common.scss` と `common.js` から読み込む
5. 質問と回答の文言を案件に合わせて編集する
6. 必要に応じてFAQPageの構造化データを追加する

## 調整ポイント

- 質問数が多い場合はEJS側で配列化する
- 既存の見出し階層に合わせて `h2` / `h3` を調整する
- 開閉アニメーションは案件のトーンに合わせて追加する

