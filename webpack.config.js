const SRC_DIR = './src',
      DIST_DIR = './dist',
      DIST_UNCOMPRESSED_DIR = './dist_uncompressed';

const SITE_DATA = {
  START_PATH: '',
  SITE_URL: 'https://example.com/',
  SITE_NAME: 'ダミーサイト名',
};

const BROWSER_SYNC_CONFIG = {
  startPath: SITE_DATA.START_PATH,
};

const IMAGE_OPTIMIZATION_CONFIG = {
  IMG_TO_WEBP_SRC_DIR: './img2webp',
  WEBP_QUALITY: 90,
};

const path = require('path'),
      glob = require('glob'),
      RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts'),
      BrowserSyncPlugin = require('browser-sync-webpack-plugin'),
      ssi = require('browsersync-ssi'),
      CopyPlugin = require('copy-webpack-plugin'),
      TerserPlugin = require('terser-webpack-plugin'),
      HtmlWebpackPlugin = require('html-webpack-plugin'),
      htmlMinifier = require('html-minifier-terser'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      sharp = require('sharp'),
      postcss = require('postcss'),
      StylelintPlugin = require('stylelint-webpack-plugin'),
      SRC_PATH = path.resolve(__dirname, SRC_DIR),
      DIST_PATH = path.resolve(__dirname, DIST_DIR),
      DIST_UNCOMPRESSED_PATH = path.resolve(__dirname, DIST_UNCOMPRESSED_DIR);

const CSS_URL_SKIP_PATTERN = /(--pc|--sp|--exc)\.(jpg|jpeg|png|webp|svg|gif)(\?\d+)?$/i;

// URLが --pc/--sp/--exc で終わる画像や、/から始まる画像はwebpackでの処理をスキップする
const cssUrlFilter = (url) => !(CSS_URL_SKIP_PATTERN.test(url) || url.startsWith('/'));

const getScssEntries = () => {
  const entries = {};
  glob.sync('**/*.scss', { cwd: SRC_PATH, ignore: '**/_*.scss' }).forEach(key => {
    entries[key.replace('.scss', '.css')] = path.resolve(SRC_PATH, key);
  });
  return entries;
};

const createScssRule = ({ sourceMap, outputStyle }) => ({
  test: /\.scss$/,
  use: [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        importLoaders: 3,
        url: {
          filter: cssUrlFilter,
        },
      }
    },
    'postcss-loader',
    {
      loader: 'resolve-url-loader',
      options: {
        sourceMap
      }
    },
    {
      loader: 'sass-loader',
      options: {
        sourceMap,
        implementation: require('sass'),
        sassOptions: {
          outputStyle
        }
      }
    }
  ],
});

const createConfig_development = ({ outputPath }) => {

  const config = {
    name: 'uncompressed',
    mode: 'development',
    devtool: false,
    entry: {},
    output: {
      path: outputPath,
      filename: '[name].js',
      assetModuleFilename: 'assets/[name][ext][query]',
    },
    module: {
      rules: [
        {
          test: /\.(jpg|jpeg|png|webp|svg|gif|eot|ttf|woff)$/i,
          type: 'asset/inline',
          exclude: [
            /node_modules/,
            path.resolve(__dirname, IMAGE_OPTIMIZATION_CONFIG.IMG_TO_WEBP_SRC_DIR),
          ],
        },
      ]
    },
    plugins: [
      new RemoveEmptyScriptsPlugin(),
    ],
    watch: false,
    target: ['web'],
  };

  // CSS
  Object.assign(config.entry, getScssEntries());
  config.module.rules.push(createScssRule({ sourceMap: true, outputStyle: 'expanded' }));
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name]'
    }),
    new StylelintPlugin({
      files: [`${SRC_DIR}/**/*.scss`],
      fix: true
    }),
    {
      apply: (compiler) => {
        // 圧縮しないCSSの最初のコメントを削除
        compiler.hooks.emit.tap('RemoveCssBannerPlugin', (compilation) => {
          const { RawSource } = compiler.webpack.sources;
          for (const assetName of Object.keys(compilation.assets)) {
            if (assetName.endsWith('.css')) {
              const originalSource = compilation.assets[assetName].source().toString();
              const cleanedSource = originalSource.replace(/\/\*![\s\S]*?\*\//g, '');
              compilation.updateAsset(assetName, new RawSource(cleanedSource));
            }
          }
        });
      }
    }
  );

  // HTML
  glob.sync('**/*.ejs', { cwd: SRC_PATH, ignore: '**/_*.ejs' }).forEach(key => {
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: path.resolve(SRC_PATH, key),
        filename: key.replace('.ejs', '.html'),
        inject: false,
        minify: false,
      })
    );
  });
  config.module.rules.push({
    test: /\.ejs$/i,
    use: [
      {
        loader: 'html-loader',
        options: {
          sources: false,
          minimize: false
        }
      }, {
        loader: 'ejs-plain-loader',
        options: {
          data: SITE_DATA
        }
      }
    ]
  });

  return config;
}

const createConfig_production = ({ outputPath }) => {
  const config = {
    name: 'production',
    dependencies: ['uncompressed'],
    mode: 'production',
    entry: {},
    output: {
      path: outputPath,
      filename: '[name].js',
      assetModuleFilename: 'assets/[name][ext][query]',
    },
    module: {
      rules: [],
    },
    plugins: [
      new RemoveEmptyScriptsPlugin(),
    ],
    optimization: {
      minimize: true,
      minimizer: [ new TerserPlugin({ extractComments: false }) ],
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'htdocs/assets/js/vendor',
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
    watch: true,
    watchOptions: {
      ignored: [
        '**/node_modules/**',
        '**/.DS_Store',
        '**/Thumbs.db',
        path.resolve(__dirname, IMAGE_OPTIMIZATION_CONFIG.IMG_TO_WEBP_SRC_DIR, '**/*.webp').replace(/\\/g, '/'),
      ],
    },
    target: ['web'],
    resolve: { extensions: ['.js'] },
  };

  // JS
  glob.sync('**/*.js', { cwd: SRC_PATH, ignore: '**/_*.js' }).forEach(key => {
    config.entry[key.replace('.js', '')] = path.resolve(SRC_PATH, key);
  });
  config.module.rules.push({
    test: /\.js$/,
    exclude: /node_modules/,
    use: 'babel-loader'
  });

  // CSS
  Object.assign(config.entry, getScssEntries());
  config.module.rules.push(createScssRule({ sourceMap: false, outputStyle: 'compressed' }));
  config.plugins.push(new MiniCssExtractPlugin({ filename: '[name]' }));

  config.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, IMAGE_OPTIMIZATION_CONFIG.IMG_TO_WEBP_SRC_DIR, '**/*.{jpg,jpeg,png}'),
          to(pathData) {
            const sourceDir = path.dirname(pathData.absoluteFilename);
            const sourceName = path.parse(pathData.absoluteFilename).name;
            return path.join(sourceDir, `${sourceName}.webp`);
          },
          async transform(content) {
            return await sharp(content)
              .webp({ quality: IMAGE_OPTIMIZATION_CONFIG.WEBP_QUALITY })
              .toBuffer();
          },
          noErrorOnMissing: true,
        },
        {
          from: DIST_UNCOMPRESSED_PATH,
          to: DIST_PATH,
          globOptions: {
            ignore: ['**/*.js', '**/*.css', '**/.DS_Store', '**/Thumbs.db'],
          },
          transform: async (content, absoluteFrom) => {
            if (absoluteFrom.endsWith('.html')) {
              return await htmlMinifier.minify(
                content.toString(), {
                collapseBooleanAttributes: true, // defer="defer" などを省略する
                collapseWhitespace: true, // 空白を除去する
                // preserveLineBreaks: true, // 改行を残す
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
                minifyJS: true,
                minifyCSS: true,
                processScripts: ['application/ld+json'],
                includeAutoGeneratedTags: false,
              });
            }
            return content;
          },
        },
      ]
    }),
    new BrowserSyncPlugin({
      ...BROWSER_SYNC_CONFIG,
      host: 'localhost',
      server: {
        baseDir: [ path.join(DIST_DIR, 'htdocs') ],
        middleware: [
          ssi({
            baseDir: path.join(DIST_DIR, 'htdocs'),
            ext: '.html'
          })
        ]
      },
      files: [
        DIST_DIR + '/**/*.html',
        DIST_DIR + '/**/*.css',
        DIST_DIR + '/**/*.js'
      ],
      ghostMode: false,
    }, { reload: true })
  );

  return config;
};

module.exports = [
  // ① 非圧縮版ビルド (CSSとHTMLのみコンパイル)
  createConfig_development({
    outputPath: DIST_UNCOMPRESSED_PATH,
  }),
  // ② 圧縮版ビルド (JSのみコンパイル、CSS/HTMLはコピー＆圧縮)
  createConfig_production({
    outputPath: DIST_PATH,
  }),
];