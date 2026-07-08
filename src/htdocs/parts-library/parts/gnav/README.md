# gnav

ヘッダー用のグローバルナビゲーションです。PCではhoverまたはfocusでメガドロップメニューが開き、SPではハンバーガーで開くドロワー内にアコーディオン形式でサブメニューが展開されます。

## 配置先の例

```txt
_gnav.ejs  -> src/htdocs/assets/html/_header.ejs（または parts/_gnav.ejs としてincludeする）
_gnav.scss -> src/htdocs/assets/css/module/_gnav.scss
_gnav.js   -> src/htdocs/assets/js/components/_gnav.js
```

## 読み込み例

EJS:

```ejs
<%- include("assets/html/parts/_gnav") %>
```

SCSS（`common.scss` に追加）:

```scss
@use "module/gnav";
```

JavaScript（`common.js` に追加）:

```js
import "./components/_gnav";
```

## 挙動

- PC（768px以上）: `.gnav_1__item--mega` に対するhover / focus-within でメガメニューを表示します。マウスがリンクとパネルの間を移動する際のチラつきを防ぐため、`mouseleave` には150msの遅延を入れています。
- SP（767px以下）: ハンバーガーボタン（`.header_1__trigger`）でナビ全体をドロワー表示します。メガメニュー項目は本文リンクと別の `.gnav_1__toggle` ボタンでアコーディオン開閉するため、リンク自体のタップ遷移を妨げません。
- Escapeキーでメガメニュー・ドロワーの両方を閉じます。
- ブレークポイントをまたいでリサイズされた場合は、開閉状態をリセットします（`matchMedia("(min-width: 768px)")` の変化を監視）。

## メモ

- メガメニューの列数・幅（`.gnav_1__mega` の `width: 600px`）は案件のカラム数に合わせて調整してください。
- ロゴ画像、各リンクのhref、メガメニュー内のバナーは案件側のダミーです。
- ヘッダーの高さやロゴサイズに応じて `.gnav_1__link` の `line-height`（PC時）を調整してください。
- ドロワー幅は `.gnav_1` の `width`/`max-width` で調整できます。
