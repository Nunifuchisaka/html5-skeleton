# gnav

ヘッダー用のグローバルナビゲーションです。PCではhoverまたはfocusでメガドロップメニューが開き、SPではハンバーガーで開くドロワー内にアコーディオン形式でサブメニューが展開されます。

## 配置先の例

```txt
_gnav.ejs      -> src/htdocs/assets/html/_header.ejs（または parts/_gnav.ejs としてincludeする）
_gnav.scss     -> src/htdocs/assets/css/module/_gnav.scss（.gnav_1）
_header.scss   -> src/htdocs/assets/css/module/_header.scss（.header_1）
_megamenu.scss -> src/htdocs/assets/css/module/_megamenu.scss（.megamenu_1）
_gnav.js       -> src/htdocs/assets/js/components/_gnav.js
```

## 読み込み例

EJS:

```ejs
<%- include("assets/html/parts/_gnav") %>
```

SCSS（`common.scss` に追加）:

```scss
@use "module/gnav";
@use "module/header";
@use "module/megamenu";
```

JavaScript（`common.js` に追加）:

```js
import "./components/_gnav";
```

## 挙動

- PC（768px以上）: `.gnav_1__item--mega` に対するhover / focus-within でメガメニューを表示します。マウスがリンクとパネルの間を移動する際のチラつきを防ぐため、`mouseleave` には300msの遅延を入れています。
- メガパネルは各項目ではなく `.header_1` を基準に中央寄せ配置しています（PC時、`.gnav_1__item` は `position: static` にして `.header_1` をpositioning contextにする設計）。そのため項目数やグリッド列幅など `.header_1` の横幅が変わっても、パネルの位置・見え方は変わりません。
- SP（767px以下）: ハンバーガーボタン（`.header_1__trigger`）でナビ全体をドロワー表示します。メガメニュー項目は本文リンクと別の `.gnav_1__toggle` ボタンでアコーディオン開閉するため、リンク自体のタップ遷移を妨げません。
- Escapeキーでメガメニュー・ドロワーの両方を閉じます。
- ブレークポイントをまたいでリサイズされた場合は、開閉状態をリセットします（`matchMedia("(min-width: 768px)")` の変化を監視）。

## メモ

- メガメニューの列数・幅（`.megamenu_1` の `width: min(600px, calc(100vw - 32px))`）は案件のカラム数に合わせて調整してください。幅は項目位置に依存させず一定値のままにし、`min()`は狭いPC幅（768px直後など）でのはみ出し防止のガードです。
- ロゴ画像、各リンクのhref、メガメニュー内のバナーは案件側のダミーです。
- ヘッダーの高さやロゴサイズに応じて `.gnav_1__link` の `line-height`（PC時）を調整してください。
- ドロワー幅は `.gnav_1` の `width`/`max-width` で調整できます。
- この html5-skeleton リポジトリ自身では、`assets/css/module/_gnav.scss`・`_header.scss`・`_megamenu.scss` はスタイルを複製せず、`@use "../../../parts-library/parts/gnav/gnav";` のようにこのフォルダのファイルを直接読み込むシムにしています（実体はここの3ファイルのみ）。そのため `_gnav.scss` 等の先頭にある `@use "../../../assets/css/tool" as *;` は、この配置場所（`parts-library/parts/gnav/`）を基準にした相対パスです。**別プロジェクトへコピー&ペーストして使う場合**は、コピー先が `assets/css/module/` になるため、この行を `@use "../tool" as *;` に書き換えてください。
