const HTML_MINITY = true,
      DIST_DIR = './www/htdocs',
      SRC_DIR = './src',
      path = require('path'),
      glob = require('glob'),
      DIST_PATH = path.resolve(__dirname, DIST_DIR),
      SRC_PATH = path.resolve(__dirname, SRC_DIR),
      RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts'),
      BrowserSyncPlugin = require('browser-sync-webpack-plugin'),
      ssi = require('./node_modules/browsersync-ssi'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      TerserPlugin = require('terser-webpack-plugin'),
      entries = {},
      plugins = [];

glob.sync('*.js', {
  cwd: SRC_DIR + '/js',
  ignore: '_*.js',
}).map(function(key){
  entries[key.replace('.js', '')] = SRC_PATH + '/js/' + key;
});

glob.sync('**/*.ejs', {
  cwd: SRC_DIR + '/html',
  ignore: '_*.ejs',
}).map(function(key){
  //console.log('key', key, key.replace('.ejs', '.html'), SRC_PATH + '/html/' + key);
  entries[key.replace('.ejs', '.html')] = SRC_PATH + '/html/' + key;
  plugins.push(
    new HtmlWebpackPlugin({
      template: SRC_PATH + '/html/' + key,
      filename: key.replace('.ejs', '.html'),
      inject: 'body',
      chunks: ['common'],
      //hash: true
    })
  );
});

glob.sync('*.scss', {
  cwd: SRC_DIR + '/scss',
  ignore: '_*.scss',
}).map(function(key){
  entries[key.replace('.scss', '.css')] = SRC_PATH + '/scss/' + key;
});

module.exports = {
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
        test: /\.ejs$/i,
        use: [
          {
            loader: 'html-loader',
            options: {
              sources: {
                // css, js以外の名前解決は行わない
                urlFilter: (attribute, value, resourcePath) => {
                  return /\.(scss|sass)$/.test(value) || /\.(js)$/.test(value);
                },
              },
              minimize: false,
            },
          }, {
            loader: 'ejs-plain-loader'
          }
        ]
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
      },
      {
        test: /node_modules\/(.+)\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: { url: false },
          },
        ],
      },
    ]
  },
  plugins: plugins.concat([
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({
      filename: './assets/css/[name]',
    }),
    new BrowserSyncPlugin({
      //https: true,
      host: 'localhost',
      port: 3000,
      server: { baseDir: [DIST_DIR] },
      startPath: '/hoge',
      files: [
        DIST_DIR + '/**/*.html',
        DIST_DIR + '/**/*.css',
        DIST_DIR + '/**/*.js',
        DIST_DIR + '/**/*.json'
      ],
      'middleware': ssi({
        baseDir: DIST_DIR,
        ext: '.html',
        version: '1.4.0'
      })
    })
  ]),
  entry: entries,
  watchOptions: {
    ignored: ['/node_modules', '/gitignore']
  },
  target: ['web', 'es5'],
};