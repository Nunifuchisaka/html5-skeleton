'use strict';

// sharpの遅延読み込み検証。node --test はテストファイルごとに別プロセスで実行されるため、
// このファイル単体で「設定生成まででsharpがロードされない」ことを確認できる。

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

test('createConfigの呼び出しまででsharpはrequireされない', () => {
  const createConfig = require('..');
  createConfig({ rootDir: path.resolve(__dirname, 'fixture/proj1') });
  const sharpLoaded = Object.keys(require.cache).some((id) =>
    id.replace(/\\/g, '/').includes('/node_modules/sharp/')
  );
  assert.equal(sharpLoaded, false);
});
