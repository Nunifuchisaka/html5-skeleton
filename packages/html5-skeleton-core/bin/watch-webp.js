#!/usr/bin/env node
'use strict';

// WebP変換watcherのCLIエントリー。子プロジェクトのルートで実行する想定
// （imgToWebpSrcDirはカレントディレクトリ基準で解決される）。
const { startWatchWebp } = require('../lib/watch-webp');

startWatchWebp();
