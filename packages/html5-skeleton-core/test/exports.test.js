'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const PKG_ROOT = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf-8'));

test('package.jsonの基本フィールド', () => {
  assert.equal(pkg.name, 'html5-skeleton-core');
  assert.equal(pkg.type, 'commonjs');
  assert.ok(pkg.main, 'mainがある');
  assert.ok(pkg.exports, 'exportsがある');
  assert.ok(pkg.files, 'filesがある');
  assert.ok(pkg.engines && pkg.engines.node && pkg.engines.npm, 'enginesがある');
  assert.ok(!pkg.scripts || !pkg.scripts.prepare, 'prepareを置かない（Git依存のlifecycle回避）');
});

test('exportsの各サブパスが実在ファイルを指す', () => {
  for (const [subpath, target] of Object.entries(pkg.exports)) {
    const targetPath = path.join(PKG_ROOT, target);
    assert.ok(fs.existsSync(targetPath), `${subpath} -> ${target} が実在する`);
  }
});

test('設定サブパスがrequireできる', () => {
  const babelConfig = require(path.join(PKG_ROOT, 'config/babel.config.js'));
  assert.ok(Array.isArray(babelConfig.presets) && babelConfig.presets.length === 2);
  const postcssConfig = require(path.join(PKG_ROOT, 'config/postcss.config.js'));
  assert.ok(Array.isArray(postcssConfig.plugins) && postcssConfig.plugins.length === 2);
  const stylelintConfig = require(path.join(PKG_ROOT, 'config/stylelint.config.js'));
  assert.equal(stylelintConfig.extends, 'stylelint-config-standard-scss');
  const eslintConfig = require(path.join(PKG_ROOT, 'config/eslint.config.js'));
  assert.ok(Array.isArray(eslintConfig));
  const imageConfig = require(path.join(PKG_ROOT, 'config/image-optimization.config.js'));
  assert.equal(imageConfig.WEBP_QUALITY, 90);
  assert.equal(imageConfig.IMG_TO_WEBP_SRC_DIR, 'img2webp');
});

test('htmlvalidate設定が同梱される', () => {
  const htmlvalidate = JSON.parse(
    fs.readFileSync(path.join(PKG_ROOT, 'config/htmlvalidate.json'), 'utf-8')
  );
  assert.ok(Array.isArray(htmlvalidate.extends));
});

test('WebP変換ロジックが公開される', () => {
  const webp = require(path.join(PKG_ROOT, 'lib/webp.js'));
  assert.equal(typeof webp.convertBuffer, 'function');
  assert.equal(typeof webp.convertFile, 'function');
});
