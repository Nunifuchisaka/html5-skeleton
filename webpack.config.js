const HTML_MINITY = true,
      DIST_DIR = './dist/htdocs',
      SRC_DIR = './src/htdocs',
      path = require('path'),
      glob = require('glob'),
      DIST_PATH = path.resolve(__dirname, DIST_DIR),
      SRC_PATH = path.resolve(__dirname, SRC_DIR),
      RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts'),
      BrowserSyncPlugin = require('browser-sync-webpack-plugin'),
      ssi = require('./node_modules/browsersync-ssi'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      //ImageminWebpWebpackPlugin= require('imagemin-webp-webpack-plugin'),
      TerserPlugin = require('terser-webpack-plugin'),
      config = {
        entry: {},
        plugins: [],
      };

module.exports = (env, argv) => {
  /*
  if ('development' === argv.mode) {
    config.devtool = 'source-map';
  }
  */
  
  const minify = 'production' === argv.mode;
  
  //JS
  glob.sync('**/*.js', {
    cwd: SRC_DIR,
    ignore: '**/_*.js'
  }).forEach(key => {
    config.entry[key.replace('.js', '')] = path.resolve(SRC_DIR, key);
  });
  
  //EJS
  glob.sync('**/*.ejs', {
    cwd: SRC_DIR,
    ignore: '**/_*.ejs'
  }).forEach(key => {
    const baseName = path.basename(key, '.ejs'),
          htmlKey = key.replace('.ejs', '.html'),
          jsKey   = key.replace('.ejs', '.js'),
          srcPath  = path.resolve(SRC_DIR, key);
    //config.entry[key] = srcPath;
    console.log('EJS : ', key, htmlKey);
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: srcPath,
        filename: htmlKey,
        inject: false,//'body',
        minify: minify && HTML_MINITY,
      })
    );
  });
  
  //SCSS
  glob.sync('**/*.scss', {
    cwd: SRC_DIR,
    ignore: '**/_*.scss',
  }).forEach(key => {
    const cssKey = key.replace('.scss', '.css');
    console.log('CSS : ', key, cssKey);
    config.entry[cssKey] = path.resolve(SRC_DIR, key);
  });
  
  //JPG
  //glob.sync('**/*.jpg', {
  //  cwd: SRC_DIR,
  //  ignore: '**/_*.jpg',
  //}).forEach(key => {
  //  const _key = key.replace('.jpg', '.webp');
  //  console.log('JPG : ', key, _key);
  //  config.entry[key] = path.resolve(SRC_DIR, key);
  //  //config.entry[_key] = path.resolve(SRC_DIR, key);
  //});
  
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
      filename: '[name]',
    }),
    new RemoveEmptyScriptsPlugin(),
  );
  
  //configを統合
  return Object.assign(config, {
    output: {
      path: DIST_PATH,
      filename: '[name].js',
      //clean: true,
      assetModuleFilename: '[name][ext][query]',
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        })
      ]
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
//                     console.log('★', attribute, value, resourcePath);
                    return false;
                    //return /\.(scss|sass)$/.test(value) || /\.(js)$/.test(value);
                  },
                },
                minimize: false,
              },
            },
            'template-ejs-loader',
            //'ejs-plain-loader'
          ]
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                //url: false,
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
                  includePaths: [
                    path.resolve(__dirname, 'node_modules')
                  ],
                  outputStyle: (minify)?'compressed':'expanded',
                }
              }
            }
          ]
        },
        {
          test: /\.(jpg|png|webp|svg|gif)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 100 * 1024,
            },
          },
        },
        {
          test: /\.(jpe?g|png|gif)$/i,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "[path][name].[ext].webp",
              },
            },
            "webp-loader?{quality: 75}",
          ],
        }
      ]
    },
    watch: true,
    watchOptions: {
      ignored: ['/node_modules', '/gitignore']
    },
    target: ['web'],
    resolve: {
      extensions: ['.ts', '.js']
    }
  });
  
};