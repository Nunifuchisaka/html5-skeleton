# 使用手順書：このプロジェクトを雛形にして新しい案件を作る

対象読者：この html5-skeleton を土台に、別の静的サイト案件を立ち上げる人。

## 先に理解しておくこと：今できることとできないこと

管理人が念頭に置いている「Unity の Prefab Variant」的な体験——**雛形（親）を更新すると、複製済みの各案件（子）にも差分無く追従できる**——は、現時点のこのリポジトリでは実現していない。

- 現状の実際の仕組みは「**丸ごと複製して1回だけ切り離す**」方式のみ。複製した瞬間に親との関係は切れ、以後は雛形側の改善が自動で反映されることはない。
- Prefab Variant 的な体験（`html5-skeleton-core` という npm パッケージにビルドの仕組みだけを切り出し、子プロジェクト側は参照バージョンを明示的に上げて更新を取り込む）は、[document/spec-core-package-extraction.md](spec-core-package-extraction.md) の設計に基づき、**リポジトリ内パッケージ（`packages/html5-skeleton-core/`）としては実装済み**。ただしGitHub別リポジトリへの切り出しとgit依存への切り替えが未了のため、更新追従の運用はまだ始められない（残作業は [manual-core-migration.md](manual-core-migration.md) 参照）。
- したがって本書は「今日実際にできる複製ベースの手順」を説明する。git依存への切り替えが完了すれば、本書は複製方式から更新追従方式へ全面的に書き換えることになる。

## この手順の実体：Claude Codeスキル「html-skeleton-new」

新規プロジェクト作成の作業自体は、Claude Codeのスキル `html-skeleton-new`（`~/.claude/skills/html-skeleton-new/SKILL.md`）に定義されている。「この雛形で新しいプロジェクトを作って」と頼めば、Claude Codeがこのスキルに従って複製・置き換えを行う。

**注意**：このスキルファイルは、雛形が `config/webpack.config.js` へ設定を移し、サイト情報を `webpack.config.js` 内の `SITE_DATA` から `src/content/text/site.json` ＋ `pages/**/*.json` に分離する前の古い構造を前提に書かれており、現状のリポジトリ構造と食い違っている（`webpack.config.js`は現在ルートになく`config/`配下、`SITE_DATA`という変数は現在存在しない）。実際に使う前にスキル側の更新が必要。本書では現在の正しい構造で手順を示す。

## 手順

### 1. 事前にサイト情報の置き場を確認する

サイト全体の情報は、`config/webpack.config.js` 内ではなく次の2箇所にある。

- `src/content/text/site.json` … `SITE_NAME` / `SITE_URL` / `START_PATH`
- `src/content/text/pages/**/*.json` … ページ単位のタイトル・description等（`src/htdocs/**/*.ejs` と同じ相対パスで対応）

### 2. コピーする・しないを決める

コピーする：
- `src/`（`content/` ・`htdocs/` 両方）
- `config/`
- ルート直下の設定ラッパー（`babel.config.js` / `postcss.config.js` / `.stylelintrc.js` / `eslint.config.js`）
- `package.json`
- `.editorconfig` / `.gitignore` / `.htmlvalidate.json` / `tsconfig.json`
- `.vscode/settings.json` / `.vscode/sftp.json`
- `README.md`
- `document/` / `material/` / `img2webp/`（いずれも`.gitkeep`のみの空フォルダなのでそのままで良い）

コピーせず作り直す：
- `.git/` … 雛形のコミット履歴とリモート（`https://github.com/Nunifuchisaka/html5-skeleton.git`）をそのまま引き継がないよう必ず除外し、コピー後に `git init` する
- `node_modules/` … `npm install` で再生成
- `package-lock.json` … `npm install` で再生成（依存を完全固定して引き継ぎたい場合のみ例外的にコピーする）
- `dist/` / `dist_uncompressed/` … 雛形のダミーデータ（`site.json` の仮のサイト名・URL）でビルドされた出力なので持ち込まない。サイト情報を書き換えた後に `npm start` で作り直す

### 3. 案件固有の値を書き換える

- `src/content/text/site.json` の `SITE_NAME` / `SITE_URL` / `START_PATH`
- `src/content/text/pages/**/*.json` の各ページのタイトル・description
- `package.json`（雛形自体には `name` フィールドが無い。案件名で管理したいならこのタイミングで追加する）
- `.vscode/sftp.json` の `host` / `username` / `password` / `remotePath`（分からなければ空のまま残し、後で埋める）
- `src/htdocs/assets/html/_head.ejs` のOGP/Twitterカードのデフォルト画像（`meta.image` 未指定時は `img/og.png` になる）・Google Fontsの指定など、案件に合わせて変えるべきか確認する
- `README.md` のタイトル・説明文

### 4. 新しいGitリポジトリとして初期化する

```bash
git init
git remote -v
```

`git remote -v` で雛形のリモートを引き継いでいないことを必ず確認する（何も表示されなければ正常）。

### 5. インストールしてビルドし直す

```bash
npm install
npm start
```

`uncompressed` → `production` の順にビルドが通ることを確認したら停止する（`Ctrl + C`）。

### 6. 反映確認

`dist/htdocs/index.html` を開き、サイト名・タイトル・OGPなどが新しい値になっているか確認する。使い方の基本（ページ追加・画像追加・デプロイなど）は [document/manual-usage.md](manual-usage.md) を参照する。

## 補足：`dist` はGit管理下にある

`.gitignore` に `dist/` / `dist_uncompressed/` の除外は無く、追跡対象になっている。複製直後にコミットすると雛形のダミー出力（仮のサイト名・URL）がそのまま入り込むため、**サイト情報を書き換えて `npm start` で作り直した後に最初のコミットをする**こと。

## 今後：本当のPrefab Variant的な運用にしたい場合

[document/spec-core-package-extraction.md](spec-core-package-extraction.md) の設計が実装されれば、以下のような体験に変わる想定。

- ビルドの仕組み（`config/webpack.config.js` の中核ロジック、Babel/PostCSS/Stylelintの既定設定など）が `html5-skeleton-core` という別パッケージに切り出され、semverタグが付く
- 子プロジェクトはこのパッケージを依存として参照し、雛形側の改善を「参照バージョンを明示的に上げる」形で取り込める（自動追従ではない）
- `src/htdocs/**` や `src/content/**`、`base/reset` などのデザイン・コンテンツは引き続き子プロジェクト側に残り、複製時の差分として保たれる

現時点ではこの仕組みは無いため、雛形側に改善を加えた場合は既存の複製済みプロジェクトへ手動で個別に反映する必要がある。
