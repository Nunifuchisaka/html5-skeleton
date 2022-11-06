const HTML_MINITY = true,
      DIST_DIR = './www/htdocs',
      SRC_DIR = './src';

const path = require('path'),
      glob = require('glob'),
      BrowserSyncPlugin = require('browser-sync-webpack-plugin'),
      RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      TerserPlugin = require('terser-webpack-plugin'),
      DIST_PATH = path.resolve(__dirname, DIST_DIR),
      SRC_PATH = path.resolve(__dirname, SRC_DIR),
      entries = {},
      plugins = [
        new MiniCssExtractPlugin({
          filename: './assets/css/[name]',
        }),
        new RemoveEmptyScriptsPlugin(),
      ];

glob.sync('*.js', {
  cwd: './src/js',
  ignore: '_*.js',
}).map(function(key){
  entries[key.replace('.js', '')] = SRC_PATH + '/js/' + key;
});

glob.sync('*.scss', {
  cwd: './src/scss',
  ignore: '_*.scss',
}).map(function(key){
  entries[key.replace('.scss', '.css')] = SRC_PATH + '/scss/' + key;
});

module.exports = {
  entry: entries,
  output: {
    path: DIST_PATH,
    filename: 'assets/js/[name].js',
  },
  optimization: {
    minimize: false,
    splitChunks: {
      name: 'vendor',
      chunks: 'initial',
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env'
          ]
        }
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
              //sourceMap: false,
              importLoaders: 2,
            }
          },
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              //sourceMap: true,
              implementation: require('sass'),
              sassOptions: {
                outputStyle: 'compressed',
              }
            }
          }
        ]
      }
    ]
  },
  target: ['web', 'es5'],
  plugins: plugins,
  watch: true,
  watchOptions: {
    ignored: ['/node_modules', '/gitignore']
  },
};