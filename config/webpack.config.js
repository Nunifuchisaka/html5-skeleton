const path = require('path');

const CONFIG_DIR = __dirname,
      PROJECT_ROOT = path.resolve(CONFIG_DIR, '..'),
      SRC_DIR = 'src',
      DIST_DIR = 'dist',
      DIST_UNCOMPRESSED_DIR = 'dist_uncompressed',
      CONTENT_TEXT_DIR = 'src/content/text';

const IMAGE_OPTIMIZATION_CONFIG = require('./image-optimization.config');

const fs = require('fs'),
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
      SRC_PATH = path.resolve(PROJECT_ROOT, SRC_DIR),
      DIST_PATH = path.resolve(PROJECT_ROOT, DIST_DIR),
      DIST_UNCOMPRESSED_PATH = path.resolve(PROJECT_ROOT, DIST_UNCOMPRESSED_DIR),
      CONTENT_TEXT_PATH = path.resolve(PROJECT_ROOT, CONTENT_TEXT_DIR);

// src/content/text/site.json（SITE_NAME等）とpages/**/*.json（ページ単位のmeta/本文）をまとめて読み込み、
// ejs-plain-loaderのdataとしてEJS側に注入する。JSONはwebpack設定の評価時に一度だけ読み込まれるため、
// 編集を反映するには npm start の再起動が必要（EJS/SCSS/JSのようなwatchによる自動反映はされない）。
const loadContentData = () => {
  const siteData = JSON.parse(fs.readFileSync(path.join(CONTENT_TEXT_PATH, 'site.json'), 'utf-8'));
  const PAGES = {};
  glob.sync('pages/**/*.json', { cwd: CONTENT_TEXT_PATH, posix: true }).forEach(key => {
    const pageKey = key.replace(/^pages\//, '').replace(/\.json$/, '');
    PAGES[pageKey] = JSON.parse(fs.readFileSync(path.join(CONTENT_TEXT_PATH, key), 'utf-8'));
  });
  return { ...siteData, PAGES };
};

const CONTENT_DATA = loadContentData();

const BROWSER_SYNC_CONFIG = {
  startPath: CONTENT_DATA.START_PATH,
  reloadOnRestart: true,
};

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

const createImageInlineRule = () => ({
  test: /\.(jpg|jpeg|png|webp|svg|gif|eot|ttf|woff)$/i,
  type: 'asset/inline',
  exclude: [
    /node_modules/,
    path.resolve(PROJECT_ROOT, IMAGE_OPTIMIZATION_CONFIG.IMG_TO_WEBP_SRC_DIR),
  ],
});

const createScssRule = ({ sourceMap, outputStyle }) => ({
  test: /\.scss$/,
  use: [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        importLoaders: 3,
        sourceMap,
        url: {
          filter: cssUrlFilter,
        },
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: require(path.resolve(CONFIG_DIR, 'postcss.config.js')),
      }
    },
    {
      // resolve-url-loaderはパーティシャル間のurl()相対パス解決にソースマップを必須とするため、
      // 最終出力にソースマップを含めない場合でも常に有効にする
      loader: 'resolve-url-loader',
      options: {
        sourceMap: true
      }
    },
    {
      loader: 'sass-loader',
      options: {
        sourceMap: true,
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
    context: PROJECT_ROOT,
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
        createImageInlineRule(),
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
    // 編集中は毎回のリビルドでstylelintが走ると重いため既定では無効。
    // 実行したい時は `STYLELINT=1 npm start` のように環境変数を付けて起動する。
    ...(process.env.STYLELINT === '1' ? [
      new StylelintPlugin({
        files: [`${SRC_DIR}/**/*.scss`],
        configFile: path.resolve(CONFIG_DIR, 'stylelint.config.js'),
        fix: true
      })
    ] : []),
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
          data: CONTENT_DATA
        }
      }
    ]
  });

  return config;
}

const createConfig_production = ({ outputPath }) => {
  const config = {
    name: 'production',
    context: PROJECT_ROOT,
    dependencies: ['uncompressed'],
    mode: 'production',
    entry: {},
    output: {
      path: outputPath,
      filename: '[name].js',
      assetModuleFilename: 'assets/[name][ext][query]',
    },
    module: {
      rules: [
        createImageInlineRule(),
      ],
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
        path.resolve(PROJECT_ROOT, IMAGE_OPTIMIZATION_CONFIG.IMG_TO_WEBP_SRC_DIR, '**/*.webp').replace(/\\/g, '/'),
      ],
    },
    target: ['web'],
    resolve: { extensions: ['.ts', '.js'] },
  };

  // JS/TS
  glob.sync('**/*.{js,ts}', { cwd: SRC_PATH, ignore: '**/_*.{js,ts}' }).forEach(key => {
    config.entry[key.replace(/\.(js|ts)$/, '')] = path.resolve(SRC_PATH, key);
  });
  config.module.rules.push({
    test: /\.(js|ts)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        configFile: path.resolve(CONFIG_DIR, 'babel.config.js'),
      }
    }
  });

  // CSS
  Object.assign(config.entry, getScssEntries());
  config.module.rules.push(createScssRule({ sourceMap: false, outputStyle: 'compressed' }));
  config.plugins.push(new MiniCssExtractPlugin({ filename: '[name]' }));

  config.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(PROJECT_ROOT, IMAGE_OPTIMIZATION_CONFIG.IMG_TO_WEBP_SRC_DIR, '**/*.{jpg,jpeg,png}'),
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
        baseDir: [ path.join(PROJECT_ROOT, DIST_DIR, 'htdocs') ],
        middleware: [
          ssi({
            baseDir: path.join(PROJECT_ROOT, DIST_DIR, 'htdocs'),
            ext: '.html'
          })
        ]
      },
      files: [
        path.join(DIST_PATH, '**/*.html').replace(/\\/g, '/'),
        path.join(DIST_PATH, '**/*.css').replace(/\\/g, '/'),
        path.join(DIST_PATH, '**/*.js').replace(/\\/g, '/')
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
