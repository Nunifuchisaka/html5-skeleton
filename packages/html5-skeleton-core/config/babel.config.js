'use strict';

// coreが提供するBabel既定設定。presetはcore自身の依存から確実に解決する（require.resolve）。
module.exports = {
  presets: [
    require.resolve('@babel/preset-env'),
    require.resolve('@babel/preset-typescript'),
  ],
};
