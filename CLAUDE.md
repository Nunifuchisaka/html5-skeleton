# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A static-site frontend build skeleton (EJS + SCSS + ES6 JS) built on Webpack 5. There is no application server or test suite — the only output is a `dist/` folder of static HTML/CSS/JS meant to be uploaded to a webhost.

## Commands

```bash
npm install       # install dependencies
npm start         # runs `webpack`: builds once, then watches src/ and serves dist/htdocs via BrowserSync
npm run validate:html   # runs html-validate against dist_uncompressed/htdocs/**/*.html
node validate-html.js   # alternate HTML validator: uses .htmlvalidate.json and prints per-file line/column errors
```

There is no test script and no lint script in `package.json`. Stylelint runs automatically as part of the build (see below, with `fix: true`, so it auto-fixes SCSS in place). ESLint is installed (`eslint.config.js` exists) but is **not** wired into webpack or any npm script — run it manually if needed: `npx eslint src`.

To build/validate a single page during development, just run `npm start` and check the corresponding file under `dist_uncompressed/htdocs/`; there's no per-file build command.

## Architecture

### Two-pass multi-config build

`webpack.config.js` exports an **array of two configs**, both built by one `webpack` invocation:

1. **`uncompressed`** (dev config) → writes to `dist_uncompressed/`. Compiles only SCSS → CSS and EJS → HTML (no JS). Not minified.
2. **`production`** → writes to `dist/`. Compiles JS (Babel + Terser) and SCSS → CSS (compressed) directly, but for HTML/other static files it **copies from `dist_uncompressed/`** via `CopyPlugin`, minifying HTML in the process (`html-minifier-terser`).

Because `production` reads from `dist_uncompressed`, the `production` config declares `name: 'production'` + `dependencies: ['uncompressed']` so Webpack's MultiCompiler builds `uncompressed` first — don't remove this or the two configs can race.

`BrowserSyncPlugin` (attached to the `production` config) serves `dist/htdocs` and injects SSI via `browsersync-ssi` (see below).

### Entry discovery is convention-based (glob), not manually listed

Both configs use `glob.sync()` over `src/htdocs` to build `entry` automatically:
- `**/*.scss` (excluding `_*.scss`) → one CSS entry per file
- `**/*.js` (excluding `_*.js`, production only) → one JS entry per file
- `**/*.ejs` (excluding `_*.ejs`) → one `HtmlWebpackPlugin` per file

**Filename convention**: a leading underscore (`_head.ejs`, `_reset.scss`, `_ignite.js`) marks a partial that is only ever pulled in via `@use`/`include()`/`import` from another file — it is never built as its own output. Files without the underscore (`base.scss`, `common.scss`, `index.ejs`, `common.js`) are standalone build entries. Adding a new page/stylesheet/script just means adding a correctly-named file under `src/htdocs`; nothing needs to be registered in webpack.config.js.

### SCSS structure

`src/htdocs/assets/css/tool/_index.scss` holds shared variables/mixins/functions (breakpoint `$breakpoint1: 767px`, `pc`/`sp` mixins, `px2vw1/2`, `clamp1`, `min1`, `max1`) and is imported with `@use "tool" as *` at the top of both `base.scss` and `common.scss`. `base.scss` handles reset/font/foundation; `common.scss` aggregates `module/` (per-component styles), `layout/`, `extra/`, and `animation/` partials.

The `css-loader` `url.filter` in `createScssRule()` deliberately skips rewriting any image URL that ends in `--pc`/`--sp`/`--exc` before the extension, or starts with `/` — these are left as literal paths rather than processed as webpack modules.

### EJS/HTML composition

Pages `include()` shared partials (`_head`, `_header`, `_footer`, `_body_before`, `_body_after`) and receive `SITE_DATA` (site name/URL) injected via `ejs-plain-loader`. Separately, `<!--#include virtual="..." -->` comments are **SSI directives**, not EJS — they're resolved at serve-time by BrowserSync's `browsersync-ssi` middleware, not at build time.

### Image pipeline (two independent systems)

- Images referenced under `src/` and inlined via the `asset/inline` rule (jpg/png/webp/svg/etc., excluding the `img2webp` dir) are base64-inlined into CSS/JS.
- `img2webp/` (project root, outside `src/`) is a separate staging folder: any `.jpg`/`.png`/`.jpeg` placed there is converted to WebP by `sharp` via `CopyPlugin` and written back **in place** in `img2webp/` (not into `dist/`). `webpackOptions.watchOptions.ignored` explicitly excludes `img2webp/**/*.webp` to avoid a watch/rebuild loop from files the build itself just wrote. Converted `.webp`/original `.jpg`/`.png` files in `img2webp/` are gitignored.

### Parts library (`src/htdocs/parts-library/`)

A copy-paste component warehouse, not part of the build itself — every file inside uses the `_`-prefixed partial convention, so nothing here is ever compiled as its own entry. Organized into `parts/` (single components), `layouts/` (page/section-sized pieces), `snippets/` (short fragments like meta tags, SSI, structured data), and `recipes/` (docs on combining multiple parts). Each part directory bundles its EJS/SCSS/JS together (e.g. `parts/accordion/_accordion.{ejs,scss,js}`) with a local `README.md` describing dependencies and where to copy it into a target project (e.g. `_accordion.ejs` → `src/htdocs/assets/html/parts/`, `_accordion.scss` → `assets/css/module/`, `_accordion.js` → `assets/js/components/`). Designed to be relocatable to its own repo later, so treat it as self-contained rather than reaching into project-specific paths.

### Deployment

`.vscode/sftp.json` configures the VSCode SFTP extension to upload `dist/` (context: `dist`) to remote `staging`/`production` FTP profiles (credentials are blank placeholders, filled in locally per environment). Deployment is not part of any npm script.
