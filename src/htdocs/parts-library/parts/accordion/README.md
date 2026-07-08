# accordion

FAQや詳細説明の開閉に使うアコーディオンです。

## 配置先の例

```txt
_accordion.ejs  -> src/htdocs/assets/html/parts/_accordion.ejs
_accordion.scss -> src/htdocs/assets/css/module/_accordion.scss
_accordion.js   -> src/htdocs/assets/js/components/_accordion.js
```

## 読み込み例

EJS:

```ejs
<%- include("assets/html/parts/_accordion") %>
```

SCSS:

```scss
@use "module/accordion";
```

JavaScript:

```js
import "./components/_accordion";
```

## メモ

- ボタンには `aria-expanded` を付けています
- 開閉対象には `hidden` を使います
- 表示アニメーションが必要な場合は、案件側で高さ制御やCSS transitionを追加してください

