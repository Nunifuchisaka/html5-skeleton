'use strict';

// ビルド基盤は html5-skeleton-core（packages/html5-skeleton-core）に切り出した。
// このファイルは createConfig() を呼ぶだけの薄いラッパー。
// GitHubへ切り出して git 依存（html5-skeleton-core）に切り替えたら、
// require先をパッケージ名に差し替える（document/manual-core-migration.md 参照）。

const path = require('path');
const createConfig = require('../packages/html5-skeleton-core');

module.exports = createConfig({
  rootDir: path.resolve(__dirname, '..'),
});
