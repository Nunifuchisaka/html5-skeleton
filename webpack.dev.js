const path = require('path'),
      commonConfig = require('./webpack.common.js'),
      BrowserSyncPlugin = require('browser-sync-webpack-plugin'),
      ssi = require('./node_modules/browsersync-ssi'),
      { merge } = require('webpack-merge');

module.exports = merge(commonConfig, {
  mode: 'production',
  cache: true,
  watch: true,
  //devtool: 'inline-source-map',
  plugins: [
    new BrowserSyncPlugin({
      //https: true,
      host: 'localhost',
      port: 3000,
      server: { baseDir: ['www/htdocs'] },
      //startPath: '/hoge',
      files: [
        "www/htdocs/**/*.html",
        "www/htdocs/**/*.css",
        "www/htdocs/**/*.js",
        "htdocs/**/*.json"
      ],
      'middleware': ssi({
        baseDir: 'www/htdocs',
        ext: '.html',
        version: '1.4.0'
      })
    })
  ]
});