const HTML_MINITY = true,
      DIST_DIR = './dist/htdocs',
      DIST2_DIR = './dist_uncompressed/htdocs',
      SRC_DIR = './src/htdocs',
      START_PATH = '',
      SITE_URL = 'https://example.com/' + START_PATH,
      SITE_NAME = 'ダミーサイト名',
      path = require('path'),
      glob = require('glob'),
      DIST_PATH = path.resolve(__dirname, DIST_DIR),
      DIST2_PATH = path.resolve(__dirname, DIST2_DIR),
      SRC_PATH = path.resolve(__dirname, SRC_DIR),
      RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts'),
      BrowserSyncPlugin = require('browser-sync-webpack-plugin'),
      ssi = require('browsersync-ssi'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      CopyPlugin = require('copy-webpack-plugin'),
      imagemin = require('imagemin'),
      imageminWebp = require('imagemin-webp'),
      StylelintPlugin = require('stylelint-webpack-plugin'),
      TerserPlugin = require('terser-webpack-plugin');

const createConfig = ({ mode, outputPath, useMinify, useOncePlugins = false }) => {
  const config = {
    entry: {},
    plugins: [
      new MiniCssExtractPlugin({ filename: '[name]' }),
      new StylelintPlugin({
        files: [SRC_DIR + '/**/*.scss'],
      }),
      new RemoveEmptyScriptsPlugin(),
    ],
  };

  glob.sync('**/*.ejs', { cwd: SRC_DIR, ignore: '**/_*.ejs' }).forEach(key => {
    const htmlKey = key.replace('.ejs', '.html');
    const srcPath  = path.resolve(SRC_DIR, key);
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: srcPath,
        filename: htmlKey,
        inject: false,
        minify: useMinify ? {
          collapseWhitespace: HTML_MINITY,
          keepClosingSlash: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
          minifyJS: true,
          processScripts: ['application/ld+json'],
        } : false
      })
    );
  });

  glob.sync('**/*.scss', { cwd: SRC_DIR, ignore: '**/_*.scss' }).forEach(key => {
    config.entry[key.replace('.scss', '.css')] = path.resolve(SRC_DIR, key);
  });

  if ('production' == mode) {
    glob.sync('**/*.js', { cwd: SRC_DIR, ignore: '**/_*.js' }).forEach(key => {
      config.entry[key.replace('.js', '')] = path.resolve(SRC_DIR, key);
    });

    config.plugins.push(
      new CopyPlugin({
        patterns: [{
          context: 'img2webp',
          from: '**/*.{jpg,jpeg,png}',
          to(pathData) { return pathData.absoluteFilename.replace(/\.(jpe?g|png)$/i, '.webp'); },
          transform(content) { return imagemin.buffer(content, { plugins: [imageminWebp({ quality: 90 })] }); },
          noErrorOnMissing: true,
        }],
      }),
      new BrowserSyncPlugin({
        host: 'localhost',
        port: 3000,
        server: { baseDir: [DIST_DIR] },
        files: [
          DIST_DIR + "/**/*.html",
          DIST_DIR + "/**/*.css",
          DIST_DIR + "/**/*.js"
        ],
        middleware: ssi({
          baseDir: DIST_DIR,
          ext: '.html'
        })
      }, { reload: true })
    );
  }

  return {
    ...config,
    mode: mode,
    output: {
      path: outputPath,
      filename: '[name].js',
      assetModuleFilename: START_PATH + 'assets/[name][ext][query]',
    },
    optimization: {
      minimize: useMinify,
      minimizer: useMinify
        ? [
            new TerserPlugin({
              extractComments: false,
              terserOptions: {
                compress: {
                  drop_console: true
                }
              }
            }),
          ]
        : [],
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'assets/js/vendor',
            chunks: 'all',
          }
        }
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.ejs$/i,
          use: [
            {
              loader: 'html-loader',
              options: {
                sources: false,
                minimize: false
              }
            },
            {
              loader: 'ejs-plain-loader',
              options: {
                data: {
                  START_PATH,
                  SITE_URL,
                  SITE_NAME
                }
              }
            },
          ]
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { importLoaders: 2 } },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('postcss-sort-media-queries')({
                      sort: 'mobile-first'
                    }),
                    require('autoprefixer'),
                  ]
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                implementation: require('sass'),
                sassOptions: {
                  includePaths: [path.resolve(__dirname, 'node_modules')],
                  outputStyle: useMinify ? 'compressed' : 'expanded',
                }
              }
            }
          ]
        },
        {
          test: /\.(jpg|png|webp|svg|gif|eot|ttf|woff)$/i,
          type: 'asset/inline',
          exclude: /(--pc|--sp)\.(jpg|png|webp|svg|gif|eot|ttf|woff)$/i,
        },
        {
          test: /node_modules\/(.+)\.css$/,
          use: [
            {
              loader: 'style-loader',
            }, {
              loader: 'css-loader',
              options: { url: false },
            },
          ],
        },
      ]
    },
    watch: true,
    watchOptions: {
      ignored: ['/node_modules', '/gitignore']
    },
    target: ['web'],
    resolve: {
      extensions: ['.ts', '.js']
    },
    stats: {
      // errorDetails: true
    }
  };
};

module.exports = [
  createConfig({
    mode: 'production',
    outputPath: DIST_PATH,
    useMinify: true,
  }),
  createConfig({
    mode: 'development',
    outputPath: DIST2_PATH,
    useMinify: false,
  })
];