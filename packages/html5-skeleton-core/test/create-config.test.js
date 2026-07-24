'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const createConfig = require('..');

const PROJ1 = path.resolve(__dirname, 'fixture/proj1');
const PROJ2 = path.resolve(__dirname, 'fixture/proj2');
const PROJ_BROKEN = path.resolve(__dirname, 'fixture/proj-broken');

const findPlugin = (config, ctorName) =>
  (config.plugins || []).filter((p) => p && p.constructor && p.constructor.name === ctorName);

test('rootDir未指定はエラー', () => {
  assert.throws(() => createConfig({}), /rootDir/);
  assert.throws(() => createConfig(), /rootDir/);
});

test('rootDirの相対パスはエラー', () => {
  assert.throws(() => createConfig({ rootDir: './fixture/proj1' }), /rootDir/);
});

test('uncompressed/productionの2設定を返し、依存順序が宣言される', () => {
  const configs = createConfig({ rootDir: PROJ1 });
  assert.equal(configs.length, 2);
  assert.equal(configs[0].name, 'uncompressed');
  assert.equal(configs[1].name, 'production');
  assert.deepEqual(configs[1].dependencies, ['uncompressed']);
});

test('エントリー探索の規約: _プレフィックスは除外、SCSSは両設定、JS/TSはproductionのみ', () => {
  const [uncompressed, production] = createConfig({ rootDir: PROJ1 });
  const scssKey = 'htdocs/assets/css/base.css';
  assert.ok(uncompressed.entry[scssKey], 'uncompressedにSCSSエントリーがある');
  assert.ok(production.entry[scssKey], 'productionにSCSSエントリーがある');
  assert.ok(!Object.keys(uncompressed.entry).some((k) => k.includes('_tool')), 'パーシャルSCSSは除外');
  assert.ok(production.entry['htdocs/assets/js/app'], 'JSエントリーはproductionにある');
  assert.ok(production.entry['htdocs/assets/js/typed'], 'TSエントリーはproductionにある');
  assert.ok(!production.entry['htdocs/assets/js/_lib'], 'パーシャルJSは除外');
  assert.ok(!Object.keys(uncompressed.entry).some((k) => k.startsWith('htdocs/assets/js/')), 'uncompressedはJSを扱わない');
});

test('EJSはHtmlWebpackPluginになり、パーシャルEJSは除外される', () => {
  const [uncompressed] = createConfig({ rootDir: PROJ1 });
  const htmlPlugins = findPlugin(uncompressed, 'HtmlWebpackPlugin');
  assert.equal(htmlPlugins.length, 1);
});

test('PAGESキーはPOSIX区切りで pages/ と .json が除かれる', () => {
  const configs = createConfig({ rootDir: PROJ1 });
  const [uncompressed] = configs;
  const ejsRule = uncompressed.module.rules.find((r) => String(r.test) === String(/\.ejs$/i));
  assert.ok(ejsRule, 'EJSルールがある');
  const ejsLoader = ejsRule.use.find((u) => u.loader && u.loader.includes('ejs-plain-loader'));
  const data = ejsLoader.options.data;
  assert.equal(data.SITE_NAME, 'プロジェクト1');
  assert.ok(data.PAGES.index, 'PAGES.index がある');
  assert.ok(data.PAGES['sub/page'], "PAGES['sub/page'] がある");
});

test('異なるrootDirを連続で処理してもCONTENT_DATAが混ざらない', () => {
  const configsA = createConfig({ rootDir: PROJ1 });
  const configsB = createConfig({ rootDir: PROJ2 });
  const getData = (configs) => {
    const rule = configs[0].module.rules.find((r) => String(r.test) === String(/\.ejs$/i));
    return rule.use.find((u) => u.loader && u.loader.includes('ejs-plain-loader')).options.data;
  };
  assert.equal(getData(configsA).SITE_NAME, 'プロジェクト1');
  assert.equal(getData(configsB).SITE_NAME, 'プロジェクト2');
  assert.ok(!getData(configsB).PAGES['sub/page'], 'proj2にproj1のページが混入しない');
});

test('site.jsonの構文エラーは対象ファイル名を含むエラーになる', () => {
  assert.throws(
    () => createConfig({ rootDir: PROJ_BROKEN }),
    (err) => err.message.includes('site.json')
  );
});

test('site.json不在は対象パスを含むエラーになる', () => {
  assert.throws(
    () => createConfig({ rootDir: path.resolve(__dirname, 'fixture/proj-nosite') }),
    (err) => err.message.includes('site.json')
  );
});

test('watch除外: img2webpの.webp標準除外が絶対パス・スラッシュ区切りで入り、ユーザー除外と併存する', () => {
  const [, production] = createConfig({ rootDir: PROJ1, watchIgnored: ['**/extra/**'] });
  const ignored = production.watchOptions.ignored;
  const webpGlob = path.resolve(PROJ1, 'img2webp', '**/*.webp').replace(/\\/g, '/');
  assert.ok(ignored.includes(webpGlob), '標準の.webp除外がある');
  assert.ok(ignored.includes('**/extra/**'), 'ユーザー除外が併存する');
});

test('loaderはrequire.resolve済みの絶対パスで埋め込まれる', () => {
  const [uncompressed, production] = createConfig({ rootDir: PROJ1 });
  const scssRule = uncompressed.module.rules.find((r) => String(r.test) === String(/\.scss$/));
  for (const entry of scssRule.use) {
    const loaderPath = typeof entry === 'string' ? entry : entry.loader;
    assert.ok(path.isAbsolute(loaderPath), `絶対パスである: ${loaderPath}`);
  }
  const jsRule = production.module.rules.find((r) => String(r.test) === String(/\.(js|ts)$/));
  assert.ok(path.isAbsolute(jsRule.use.loader), 'babel-loaderが絶対パスである');
});

test('plugins.uncompressed / plugins.production は他方へ混入しない', () => {
  class MarkerA { apply() {} }
  class MarkerB { apply() {} }
  const [uncompressed, production] = createConfig({
    rootDir: PROJ1,
    plugins: { uncompressed: [new MarkerA()], production: [new MarkerB()] },
  });
  assert.equal(findPlugin(uncompressed, 'MarkerA').length, 1);
  assert.equal(findPlugin(uncompressed, 'MarkerB').length, 0);
  assert.equal(findPlugin(production, 'MarkerB').length, 1);
  assert.equal(findPlugin(production, 'MarkerA').length, 0);
});

test('resolve.aliasは両設定に適用される', () => {
  const alias = { '@': path.join(PROJ1, 'src') };
  const [uncompressed, production] = createConfig({ rootDir: PROJ1, resolve: { alias } });
  assert.deepEqual(uncompressed.resolve.alias, alias);
  assert.deepEqual(production.resolve.alias, alias);
});

test('copyPatternsは標準パターンの後に連結される', () => {
  const extra = { from: path.join(PROJ1, 'src/content/text/site.json'), to: 'copied/site.json' };
  const [, production] = createConfig({ rootDir: PROJ1, copyPatterns: [extra] });
  const copyPlugins = findPlugin(production, 'CopyPlugin');
  assert.equal(copyPlugins.length, 1);
  const patterns = copyPlugins[0].patterns;
  assert.equal(patterns.length, 3, '標準2パターン+追加1パターン');
  assert.equal(patterns[2].to, 'copied/site.json', '追加パターンが末尾');
});

test('CopyPluginはBrowserSyncPluginより前に並ぶ', () => {
  const [, production] = createConfig({ rootDir: PROJ1 });
  const names = production.plugins.map((p) => p.constructor.name);
  const copyIndex = names.indexOf('CopyPlugin');
  const bsIndex = names.indexOf('BrowserSyncPlugin');
  assert.ok(copyIndex >= 0 && bsIndex >= 0 && copyIndex < bsIndex);
});

test('browserSyncオプションで標準設定を上書きできる', () => {
  const [, production] = createConfig({ rootDir: PROJ1, browserSync: { port: 4000 } });
  const bs = findPlugin(production, 'BrowserSyncPlugin')[0];
  assert.equal(bs.browserSyncOptions.port, 4000);
  assert.equal(bs.browserSyncOptions.startPath, '/htdocs', '標準値も残る');
});

test('extendConfigは各設定で1回ずつ呼ばれ、contextに名前と解決済みパスが渡る', () => {
  const calls = [];
  createConfig({
    rootDir: PROJ1,
    extendConfig(config, context) {
      calls.push(context);
      return config;
    },
  });
  assert.deepEqual(calls.map((c) => c.name), ['uncompressed', 'production']);
  for (const context of calls) {
    assert.ok(path.isAbsolute(context.paths.rootDir));
    assert.ok(path.isAbsolute(context.paths.srcDir));
    assert.ok(path.isAbsolute(context.paths.distDir));
  }
});

test('extendConfigで不変条件を壊すと設定名を含むエラーになる', () => {
  assert.throws(
    () =>
      createConfig({
        rootDir: PROJ1,
        extendConfig(config) {
          if (config.name === 'production') {
            config.dependencies = [];
          }
          return config;
        },
      }),
    /production/
  );
  assert.throws(
    () =>
      createConfig({
        rootDir: PROJ1,
        extendConfig(config) {
          if (config.name === 'production') {
            config.plugins = config.plugins.filter((p) => p.constructor.name !== 'CopyPlugin');
          }
          return config;
        },
      }),
    /CopyPlugin/
  );
  assert.throws(
    () =>
      createConfig({
        rootDir: PROJ1,
        extendConfig(config) {
          if (config.watchOptions) {
            config.watchOptions.ignored = ['**/node_modules/**'];
          }
          return config;
        },
      }),
    /webp/i
  );
});

test('stylelintオプションでStylelintPluginが有効化される', () => {
  const [uncompressedOff] = createConfig({ rootDir: PROJ1, stylelint: false });
  assert.equal(findPlugin(uncompressedOff, 'StylelintWebpackPlugin').length, 0);
  const [uncompressedOn] = createConfig({ rootDir: PROJ1, stylelint: true });
  assert.equal(findPlugin(uncompressedOn, 'StylelintWebpackPlugin').length, 1);
});
