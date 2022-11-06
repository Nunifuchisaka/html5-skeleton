const { merge } = require('webpack-merge'),
      commonConfig = require('./webpack.common.js'),
      TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(commonConfig, {
  cache: false,
  mode: 'production',
  devtool: false,
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          ecma: 6,
          compress: true,
          output: {
            comments: false,
            beautify: false
          }
        }
      })
    ]
  }
});
