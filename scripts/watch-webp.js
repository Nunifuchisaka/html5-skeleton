'use strict';

// WebP変換watcherの実体は html5-skeleton-core に切り出した。
// このファイルは npm run webp の起動パスを維持するための薄いラッパー。
const path = require('path');
const { startWatchWebp } = require('../packages/html5-skeleton-core/lib/watch-webp');

startWatchWebp({ rootDir: path.resolve(__dirname, '..') });
