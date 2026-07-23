# samplesエリアの規約詳細

`src/htdocs/samples/` に新しいブロックを追加する際の、実ファイルから確認済みの規約。

## ディレクトリ構成

```
src/htdocs/samples/
├── index.ejs
└── assets/
    ├── html/<name>.ejs        # フラグメント本体（1ファイル1ブロック、サブフォルダなし）
    ├── css/
    │   ├── all.scss           # アグリゲーター（ビルドエントリ）
    │   ├── module/_<name>.scss   # 単一コンポーネント
    │   ├── extra/_<name>.scss    # 他ブロックに付随する装飾/オーバーレイ（例: メガメニュー）
    │   └── tool/_index.scss   # samples固有の変数（$contents マップ等。nav専用で汎用の登録機構ではない）
    └── js/
        ├── all.js             # ビルドエントリ
        └── components/_<name>.js  # 挙動があるブロックのみ
```

## EJSフラグメント（`assets/html/<name>.ejs`）

- `<!doctype>`/`<html>`のラッパーは書かない。生のマークアップのみ。
- 他ブロックを内包する場合はEJSの `<%- include("other_name") %>` で取り込む（例: `header_1.ejs` が `nav_1.ejs` を include）。
- 閉じタグ直後に `<!-- /.blockname -->` というコメントを置く。

実例（`header_1.ejs`）:
```ejs
<header class="header_1">
  <div class="header_1__1">
    <h1>
      <a href="/">
        サイト名
      </a>
    </h1>
  </div>
  <%- include("nav_1") %>
</header><!-- /.header_1 -->
```

## SCSSパーシャル（`assets/css/{module,extra}/_<name>.scss`）

冒頭は必ずこの3行（`module/`・`extra/`は同じ階層なのでimportパスは共通）：
```scss
@use "sass:math";
@use "../../../../assets/css/tool" as *;   // 本サイト共通tool: pc/sp mixin, px2vw1/2, clamp1, min1, max1
@use "../tool" as samples;                  // samples専用tool（$contents マップ等。無関係なブロックでは触らない）
```

ブロック定義の直前には必ずドキュメントコメント：
```scss
/*
## .blockname_N
使用箇所：
内容：
*/
```
（関連ブロックがあれば「関連：.other_block」も追記。`extra/_megamenu.scss` を参照）

BEM要素は `&__element` ネスト。深いネストの中で複合セレクタ（`&.is_open` 等）と組み合わせてブロック自身を再参照する必要がある場合のみ `$block: &;` を宣言し `#{$block}__element` の形で使う。単純な `&__element` ネストだけなら不要（`.nav_1` は使用、`.nav_2`/`.header_1` は不要）。

状態/モディファイアクラスは `--modifier` ではなく `.is_xxx`（`.is_open`, `.is_scrolled` 等）。外部サイトの `.active`/`.open`/`.is-visible` のようなクラスは移植時に `.is_xxx` へ変換する。

レスポンシブはハードコードした `@media` を書かず、`@include pc { }` / `@include sp { }`（ブレークポイント`$breakpoint1: 767px`）、`px2vw1()`（pc用vw換算）/`px2vw2()`（sp用vw換算）、`clamp1()`、`min1()`、`max1()` を使う。素直に対応できる範囲でよく、無理に置き換える必要はない。

実例（`_header.scss`）:
```scss
@use "sass:math";
@use "../../../../assets/css/tool" as *;
@use "../tool" as samples;

/*
## .header_1
使用箇所：
内容：グローバルヘッダー
*/

.header_1 {
  position: sticky;
  top: 0;
  &__1 {
    max-width: $width3;
    margin: 0 auto;
    padding: .5em 0;
    @include sp {
      padding-right: px2vw2(60);
      box-sizing: border-box;
    }
  }
}
```

`$block: &;` を使う実例（`_nav.scss` の `.nav_1` 抜粋）:
```scss
.nav_1 {
  $block: &;
  &__main {
    > li {
      @each $content, $props in samples.$contents {
        li.is_#{$content} & { border-top-color: map.get($props, color); }
      }
    }
  }
}
```

## ブロック名と連番

`<英単語>_<連番>`（例: `header_1`, `nav_1`, `nav_2`, `megamenu_1`）。新規追加時は同名衝突を避けるため、以下の両方をgrepして次の空き番号を採用する（メインサイトとsamplesは同じDOMに両方のCSSが読み込まれるため、片方だけ確認すると衝突に気づけない）：

```bash
grep -rEo '\.[a-z_]+_[0-9]+' src/htdocs/samples/assets/css/{module,extra}/*.scss
grep -rEo '\.[a-z_]+_[0-9]+' src/htdocs/assets/css/module/*.scss
```

## JS（`assets/js/components/_<name>.js`）

挙動があるブロックのみ作成。既存クラス名だけをキーにした自己完結のvanilla JSで、存在チェックのガード句を先頭に置く（`_nav_1.js` のスタイル）:
```js
const nav_1 = document.querySelector('.nav_1');
if (nav_1) {
  // ...
}
```
jQueryはグローバルで使用可能だが、既存コードは基本vanilla JS（`all.js` に `// import $ from 'jquery';` とコメントアウトで存在が示されているのみ）。

フレームワーク依存（React/Vueのコンポーネント内部実装など）のコードはそのまま移植しない。見た目の挙動を1〜2文で説明した上で、上記スタイルのvanilla JSとして再実装する。

## 登録（アグリゲーターへの追記）

`config/webpack.config.js` の編集は一切不要（globで自動検出される）。以下の3ファイルのみ編集する：

1. `assets/css/all.scss` — 該当グループ（`module`/`extra`）の末尾に `@use "module/<name>";` または `@use "extra/<name>";` を追記。
   ```scss
   @use "../../../assets/css/tool" as *;
   @use "tool" as samples;

   @use "module/header";
   @use "module/nav";

   @use "extra/megamenu";
   ```
2. `assets/js/all.js` — JSを追加した場合のみ `import './components/_<name>';` を追記。
3. `samples/index.ejs` — `<main>` 内に `<!--#include virtual="/samples/assets/html/<name>.html" -->` を追記（EJSの`include()`ではなくSSI。BrowserSyncの`browsersync-ssi`ミドルウェアが配信時に解決するため、`dist_uncompressed`のビルド結果ではコメントのまま残るのが正しい）。冪等にする：既に同じ行があれば追記しない。
