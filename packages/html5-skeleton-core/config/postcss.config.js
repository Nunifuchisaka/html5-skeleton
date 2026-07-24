'use strict';

// coreが提供するPostCSS既定設定。pluginはcore自身の依存から確実に解決する。
module.exports = {
  plugins: [
    require('autoprefixer')(),
    require('postcss-sort-media-queries')({
      sort: 'desktop-first', // 'mobile-first'
    }),
  ],
};
