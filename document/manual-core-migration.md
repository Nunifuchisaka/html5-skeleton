# html5-skeleton-core 移行手順書（残作業）

作成日: 2026-07-24
前提仕様: [spec-core-package-extraction.md](spec-core-package-extraction.md)（ドラフトv2）

## 現在の状態（このリポジトリでの実施内容と検証結果）

ビルド基盤を `packages/html5-skeleton-core/` に**リポジトリ内パッケージ**として切り出した。

- `createConfig()` API・設定サブパス（Babel/PostCSS/Stylelint/ESLint/html-validate/画像設定）・WebP変換ロジック・watch CLIを実装
- `config/webpack.config.js` ほか `config/*.js`・`scripts/watch-webp.js` は core を相対パスで参照する薄いラッパーに置換

検証結果（2026-07-24時点）:

| 検証 | 結果 |
| --- | --- |
| `npm run test:core`（core単体テスト25件） | 全件パス |
| 成果物同一性（`npm run build:once` → `npm run hash:verify`） | 切り出し前後で `dist/`・`dist_uncompressed/` の全53ファイルが SHA-256 一致（baseline: `tmp/core-migration-baseline.json`） |
| `npm run validate:html` | パス（エラーなし） |
| `npm run type-check` | パス（エラーなし） |
| `npx eslint src` | **エラー11件・警告3件**（`src/htdocs/samples/video/` 配下のセミコロン欠落・未使用メンバー）。ESLint設定は内容を変えずにcoreへ移しており、これらは移行前から存在する既存コードの指摘。移行の合否には含めない（修正は別タスク） |
| `npm start` 実機確認（BrowserSync/SSI/WebP変換） | 未実施（watch常駐のため自動運転では実施せず。切り替え時の手順7で確認する） |

仕様との差分（意図的なもの）:

- **配布形態が未完**。仕様は GitHub 別リポジトリ + git 依存（`github:Nunifuchisaka/html5-skeleton-core#v1.0.0`）だが、現状は `packages/` 配下に置き相対 `require` で参照している。GitHubリポジトリの新設・push・タグ付け・依存インストールは自動運転の権限外のため、下記の手動手順に残した。
- **依存の振り分け（仕様3.1）が未適用**。ルートの `package.json` はまだ全依存を持つ。`npm install` を伴うため、git依存への切り替えと同じコミットで行う。
- **html-validate CLI の所有者は「子」と決定**（仕様5の保留事項）。ルートの `validate:html` スクリプトと `.htmlvalidate.json` を維持し、coreは設定のコピーを `html5-skeleton-core/htmlvalidate` として同梱する。**正はルートの `.htmlvalidate.json`**（JSONのためcore側をrequireで参照できず、当面はコピー2部持ち。変更時は両方を揃えること）。
- **WebP完全無効化オプションは見送り**（仕様5）。sharpの遅延ロードと明確なエラーは実装済み。
- **不変条件「すべての出力先がrootDir基準」の機械検証は `output.path` のみ**。`copyPatterns` や `extendConfig` で利用者が追加するCopyPluginパターンの `to`、絶対パス指定の `imgToWebpSrcDir` までは検証していない（自家用パッケージとして許容。厳密化する場合はcoreの `assertInvariants` に追加する）。
- **テンプレート側 `package.json` の `engines` は未追加**。仕様4.5はcore・テンプレート双方に同じ `engines` を求めるが、現ローカル環境がNode 20のため、Node更新とあわせて下記残作業3で追加する。

## 手動で行う残作業

### 1. GitHubリポジトリへの切り出し

```bash
# 新リポジトリを作成してcoreの内容をコピー
mkdir ~/projects/html5-skeleton-core
cp -R ~/projects/html5-skeleton/packages/html5-skeleton-core/ ~/projects/html5-skeleton-core/
cd ~/projects/html5-skeleton-core
git init
git add -A
git commit -m "html5-skeleton-core v1.0.0: ビルド基盤の初回切り出し"
gh repo create Nunifuchisaka/html5-skeleton-core --private --source . --push
```

### 2. パッケージ検証（仕様4.6の段階3〜5）

```bash
# 同梱内容の確認（filesとexportsの通り入っているか）
npm pack --dry-run

# tarball経由のインストール検証（別ディレクトリのfixtureで）
npm pack
npm install ../path/to/html5-skeleton-core-1.0.0.tgz

# 問題なければ不変タグを付与
git tag v1.0.0
git push origin v1.0.0
```

テスト実行は切り出し先リポジトリでは `node --test test/*.test.js`。

### 3. html5-skeleton側の参照切り替え（移行ブランチで）

1. ベースラインタグを付ける: `git tag pre-core-migration && git push origin pre-core-migration`
2. `package.json` の `devDependencies` に追加: `"html5-skeleton-core": "github:Nunifuchisaka/html5-skeleton-core#v1.0.0"`
3. 同じ変更で依存の振り分け（仕様3.1）: coreの `dependencies` に移った32パッケージ（webpack/loader/plugin/sass/sharp等）をルートの `devDependencies` から削除し、子側に残す8パッケージ（`@types/jquery` / `eslint` / `eslint-webpack-plugin` / `globals` / `playwright` / `typescript` / `typescript-eslint` / `typescript-native`）+ `html-validate` + `@eslint/js`（coreのESLint設定のpeer、明示追加）を維持する
4. ルートの `package.json` にcoreと同じ `engines`（Node 22/24 LTS・npm 10以上）を追加し、`npm install` を実行して `package-lock.json` を更新
5. 参照をパッケージ名に差し替え:
   - `config/webpack.config.js`: `require('../packages/html5-skeleton-core')` → `require('html5-skeleton-core')`
   - `config/babel.config.js` 等: `require('../packages/html5-skeleton-core/config/babel.config.js')` → `require('html5-skeleton-core/babel')`（postcss/stylelint/eslint/image-optimizationも同様）
   - `scripts/watch-webp.js`: `require('../packages/html5-skeleton-core/lib/watch-webp')` → `require('html5-skeleton-core/watch-webp')`
   - ルートの `package.json` から `test:core` スクリプトを削除（テストはcoreリポジトリ側へ）
6. `packages/` ディレクトリを削除
7. 検証: `npm run build:once` → `npm run hash:verify`（53ファイル一致を再確認）、`npm run validate:html`、`npm run type-check`、`npm start` でBrowserSync/SSI/WebP変換の実動作確認
8. ひとつの移行コミットとしてmasterへマージ

### 4. ロールバック手順（仕様4.6）

参照タグを戻すだけでは行わない。移行コミット全体を `git revert` し、`npm ci` で旧依存と旧設定を復元する。masterへのマージ前に移行ブランチ上で実地確認すること。

## 注意事項

- **Nodeバージョン**: coreの `engines` は仕様どおり Node 22/24 LTS・npm 10以上。ただし現在のローカル環境は Node v20.19.3 であり、範囲外（動作はしているが警告対象）。git依存への切り替え前に Node 22 LTS 以上への更新を推奨する。
- 公開済みタグの付け直しは禁止。修正はv1.0.1等の新タグで行う。
- coreの更新を子プロジェクトへ取り込む際は、参照タグと `package.json`+`package-lock.json` を同じ変更としてコミットする（自動追従はしない）。
- `html-skeleton-new` スキル（`~/.claude/skills/html-skeleton-new/SKILL.md`）は旧構造（ルート直下 `webpack.config.js`・`SITE_DATA` 変数）前提のまま古くなっているため、本移行の完了後に合わせて更新が必要。
