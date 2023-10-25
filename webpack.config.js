const HTML_MINITY = true,
      DIST_DIR = './www/htdocs',
      SRC_DIR = './src',
      path = require('path'),
      glob = require('glob'),
      DIST_PATH = path.resolve(__dirname, DIST_DIR),
      SRC_PATH = path.resolve(__dirname, SRC_DIR),
      { CleanWebpackPlugin } = require('clean-webpack-plugin'),
      RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts'),
      BrowserSyncPlugin = require('browser-sync-webpack-plugin'),
      ssi = require('./node_modules/browsersync-ssi'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      TerserPlugin = require('terser-webpack-plugin'),
      config = {
        entry: {},
        plugins: [],
      };

module.exports = (env, argv) => {
  if ('development' === argv.mode) {
    config.devtool = 'source-map';
  }
  
  const minify = 'production' === argv.mode;
  
  //JS
  glob.sync('**/*.js', {
    cwd: './src/js',
    ignore: '**/_*.js'
  }).forEach(key => {
    const basename = path.basename(key, '.js');
    config.entry[basename] = path.resolve('src', 'js', key);
    //key.replace('.js', '')
  });
  
  //EJS
  glob.sync('**/*.ejs', {
    cwd: './src/html',
    ignore: '**/_*.ejs'
  }).forEach(key => {
    const baseName = path.basename(key, '.ejs'),
          htmlKey = key.replace('.ejs', '.html'),
          jsKey   = key.replace('.ejs', '.js'),
          srcPath  = path.resolve('src', 'html', key);
    //config.entry[key] = srcPath;
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: srcPath,
        filename: htmlKey,
        inject: false,//'body',
        includeSiblingChunks: true,
        chunks:['vendor', 'common', baseName],
        minify: minify,
        //hash: true
      })
    );
  });
  
  //SCSS
  glob.sync('**/*.scss', {
    cwd: './src/scss',
    ignore: '**/_*.scss',
  }).forEach(key => {
    config.entry[key.replace('.scss', '.css')] = path.resolve('src', 'scss', key);
  });
  
  //pluginsを統合
  config.plugins.push(
    new BrowserSyncPlugin({
      //https: true,
      host: 'localhost',
      port: 3000,
      server: { baseDir: [DIST_DIR] },
      //startPath: '/hoge',
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
    }),
    new MiniCssExtractPlugin({
      filename: './assets/css/[name]',
    }),
    new RemoveEmptyScriptsPlugin(),
    new CleanWebpackPlugin({
      exclude: ['**/*.jpg']
    })
  );
  
  //configを統合
  return Object.assign(config, {
    output: {
      path: DIST_PATH,
      filename: './assets/js/[name].js',
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
                  urlFilter: (attribute, value, resourcePath) => {
                    console.log('★', attribute, value, resourcePath);
                    return false;
                    //return /\.(scss|sass)$/.test(value) || /\.(js)$/.test(value);
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
    watchOptions: {
      ignored: ['/node_modules', '/gitignore']
    },
    target: ['web', 'es5'],
  });
};
