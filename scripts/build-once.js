'use strict';

// watch・BrowserSyncなしで一度だけフルビルドするランナー。
// core切り出し前後の成果物同一性検証（scripts/hash-dist.js）とCIでの単発ビルドに使う。
// 設定は通常ビルドと同じ config/webpack.config.js を読み込み、watchを外し
// BrowserSyncPluginだけを除去する（BrowserSyncは出力ファイルに関与しない）。

const webpack = require('webpack');

const configs = require('../config/webpack.config.js').map((config) => ({
  ...config,
  watch: false,
  plugins: (config.plugins || []).filter(
    (plugin) => plugin && plugin.constructor && plugin.constructor.name !== 'BrowserSyncPlugin'
  ),
}));

webpack(configs, (err, stats) => {
  if (err) {
    console.error(err.stack || err);
    process.exit(1);
  }
  console.log(stats.toString({ colors: false, chunks: false, modules: false }));
  process.exit(stats.hasErrors() ? 1 : 0);
});
