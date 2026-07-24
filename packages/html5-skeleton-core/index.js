'use strict';

// html5-skeleton-core: 静的サイト向け2パスビルド（uncompressed→production）のwebpack設定を
// 生成する。子プロジェクトの config/webpack.config.js はこのcreateConfig()を呼ぶだけの
// 薄いラッパーとする。仕様は html5-skeleton リポジトリの
// document/spec-core-package-extraction.md を正とする。

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const ssi = require('browsersync-ssi');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const htmlMinifier = require('html-minifier-terser');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');

const { loadContentData } = require('./lib/content-data');
const webp = require('./lib/webp');
const IMAGE_OPTIMIZATION_CONFIG = require('./config/image-optimization.config');

const CSS_URL_SKIP_PATTERN = /(--pc|--sp|--exc)\.(jpg|jpeg|png|webp|svg|gif)(\?\d+)?$/i;

// URLが --pc/--sp/--exc で終わる画像や、/から始まる画像はwebpackでの処理をスキップする
const cssUrlFilter = (url) => !(CSS_URL_SKIP_PATTERN.test(url) || url.startsWith('/'));

const toPosix = (value) => value.replace(/\\/g, '/');

// rootDir必須・絶対パス必須。その他のパスオプションはここで一度だけ絶対パス化する。
// 相対値は必ず子側のrootDirを基準にし、coreの__dirnameや暗黙のprocess.cwd()は使わない。
const resolvePaths = (options) => {
  const { rootDir } = options;
  if (typeof rootDir !== 'string' || rootDir === '') {
    throw new Error('[html5-skeleton-core] rootDir は必須です（子プロジェクトのルートを絶対パスで指定してください）');
  }
  if (!path.isAbsolute(rootDir)) {
    throw new Error(`[html5-skeleton-core] rootDir は絶対パスで指定してください: ${rootDir}`);
  }
  const resolve = (value) => path.resolve(rootDir, value);
  return {
    rootDir,
    srcDir: resolve(options.srcDir ?? './src'),
    distDir: resolve(options.distDir ?? './dist'),
    distUncompressedDir: resolve(options.distUncompressedDir ?? './dist_uncompressed'),
    contentTextDir: resolve(options.contentTextDir ?? './src/content/text'),
    imgToWebpSrcDir: resolve(options.imgToWebpSrcDir ?? IMAGE_OPTIMIZATION_CONFIG.IMG_TO_WEBP_SRC_DIR),
  };
};

const getScssEntries = (srcPath) => {
  const entries = {};
  glob.sync('**/*.scss', { cwd: srcPath, ignore: '**/_*.scss' }).forEach(key => {
    entries[key.replace('.scss', '.css')] = path.resolve(srcPath, key);
  });
  return entries;
};

const createImageInlineRule = (paths) => ({
  test: /\.(jpg|jpeg|png|webp|svg|gif|eot|ttf|woff)$/i,
  type: 'asset/inline',
  exclude: [
    /node_modules/,
    paths.imgToWebpSrcDir,
  ],
});

const createScssRule = ({ sourceMap, outputStyle, sassOptions }) => ({
  test: /\.scss$/,
  use: [
    MiniCssExtractPlugin.loader,
    {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 3,
        sourceMap,
        url: {
          filter: cssUrlFilter,
        },
      }
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        postcssOptions: require('./config/postcss.config'),
      }
    },
    {
      // resolve-url-loaderはパーティシャル間のurl()相対パス解決にソースマップを必須とするため、
      // 最終出力にソースマップを含めない場合でも常に有効にする
      loader: require.resolve('resolve-url-loader'),
      options: {
        sourceMap: true
      }
    },
    {
      loader: require.resolve('sass-loader'),
      options: {
        sourceMap: true,
        implementation: require('sass'),
        sassOptions: {
          outputStyle,
          ...sassOptions,
        }
      }
    }
  ],
});

const createEjsRule = (contentData) => ({
  test: /\.ejs$/i,
  use: [
    {
      loader: require.resolve('html-loader'),
      options: {
        sources: false,
        minimize: false
      }
    }, {
      loader: require.resolve('ejs-plain-loader'),
      options: {
        data: contentData
      }
    }
  ]
});

const createConfig_uncompressed = ({ paths, contentData, options }) => {
  const config = {
    name: 'uncompressed',
    context: paths.rootDir,
    mode: 'development',
    devtool: false,
    entry: {},
    output: {
      path: paths.distUncompressedDir,
      filename: '[name].js',
      assetModuleFilename: 'assets/[name][ext][query]',
    },
    module: {
      rules: [
        createImageInlineRule(paths),
      ]
    },
    plugins: [
      new RemoveEmptyScriptsPlugin(),
    ],
    resolve: { alias: { ...(options.resolve?.alias ?? {}) } },
    watch: false,
    target: ['web'],
  };

  // CSS
  Object.assign(config.entry, getScssEntries(paths.srcDir));
  config.module.rules.push(createScssRule({ sourceMap: true, outputStyle: 'expanded', sassOptions: options.sassOptions ?? {} }));
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name]'
    }),
    // 編集中は毎回のリビルドでstylelintが走ると重いため既定では無効。
    // 実行したい時は `STYLELINT=1 npm start` のように環境変数を付けて起動する。
    ...(options.stylelint ? [
      new StylelintPlugin({
        files: [`${toPosix(path.relative(paths.rootDir, paths.srcDir))}/**/*.scss`],
        configFile: require.resolve('./config/stylelint.config'),
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
  glob.sync('**/*.ejs', { cwd: paths.srcDir, ignore: '**/_*.ejs' }).forEach(key => {
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: path.resolve(paths.srcDir, key),
        filename: key.replace('.ejs', '.html'),
        inject: false,
        minify: false,
      })
    );
  });
  config.module.rules.push(createEjsRule(contentData));

  // 用途別オプション: uncompressed設定への追加プラグイン
  config.plugins.push(...(options.plugins?.uncompressed ?? []));

  return config;
};

const createConfig_production = ({ paths, contentData, options }) => {
  const standardWatchIgnored = [
    '**/node_modules/**',
    '**/.DS_Store',
    '**/Thumbs.db',
    toPosix(path.join(paths.imgToWebpSrcDir, '**/*.webp')),
  ];

  const config = {
    name: 'production',
    context: paths.rootDir,
    dependencies: ['uncompressed'],
    mode: 'production',
    entry: {},
    output: {
      path: paths.distDir,
      filename: '[name].js',
      assetModuleFilename: 'assets/[name][ext][query]',
    },
    module: {
      rules: [
        createImageInlineRule(paths),
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
        ...standardWatchIgnored,
        ...(options.watchIgnored ?? []),
      ],
    },
    target: ['web'],
    resolve: { extensions: ['.ts', '.js'], alias: { ...(options.resolve?.alias ?? {}) } },
  };

  // JS/TS
  glob.sync('**/*.{js,ts}', { cwd: paths.srcDir, ignore: '**/_*.{js,ts}' }).forEach(key => {
    config.entry[key.replace(/\.(js|ts)$/, '')] = path.resolve(paths.srcDir, key);
  });
  config.module.rules.push({
    test: /\.(js|ts)$/,
    exclude: /node_modules/,
    use: {
      loader: require.resolve('babel-loader'),
      options: {
        ...require('./config/babel.config'),
        babelrc: false,
        configFile: false,
      }
    }
  });

  // CSS
  Object.assign(config.entry, getScssEntries(paths.srcDir));
  config.module.rules.push(createScssRule({ sourceMap: false, outputStyle: 'compressed', sassOptions: options.sassOptions ?? {} }));
  config.plugins.push(new MiniCssExtractPlugin({ filename: '[name]' }));

  const webpQuality = options.webpQuality ?? IMAGE_OPTIMIZATION_CONFIG.WEBP_QUALITY;

  config.plugins.push(
    new CopyPlugin({
      patterns: [
        {
          from: toPosix(path.join(paths.imgToWebpSrcDir, '**/*.{jpg,jpeg,png}')),
          to(pathData) {
            const sourceDir = path.dirname(pathData.absoluteFilename);
            const sourceName = path.parse(pathData.absoluteFilename).name;
            return path.join(sourceDir, `${sourceName}.webp`);
          },
          async transform(content) {
            // sharpは変換実行時に遅延ロードされる（lib/webp.js参照）
            return await webp.convertBuffer(content, webpQuality);
          },
          noErrorOnMissing: true,
        },
        {
          from: paths.distUncompressedDir,
          to: paths.distDir,
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
        // 用途別オプション: 標準パターンの後、BrowserSyncより前に追加するCopyPluginパターン
        ...(options.copyPatterns ?? []),
      ]
    }),
    new BrowserSyncPlugin({
      startPath: contentData.START_PATH,
      reloadOnRestart: true,
      host: 'localhost',
      server: {
        baseDir: [ path.join(paths.distDir, 'htdocs') ],
        middleware: [
          ssi({
            baseDir: path.join(paths.distDir, 'htdocs'),
            ext: '.html'
          })
        ]
      },
      files: [
        toPosix(path.join(paths.distDir, '**/*.html')),
        toPosix(path.join(paths.distDir, '**/*.css')),
        toPosix(path.join(paths.distDir, '**/*.js'))
      ],
      ghostMode: false,
      // 用途別オプション: 標準BrowserSync設定に対する上書き
      ...(options.browserSync ?? {}),
    }, { reload: true })
  );

  // 用途別オプション: production設定への追加プラグイン
  config.plugins.push(...(options.plugins?.production ?? []));

  return config;
};

// extendConfig実行後にも保たれるべき不変条件。違反時は設定名と違反項目を含むエラーで停止する。
const assertInvariants = (config, paths) => {
  const fail = (message) => {
    throw new Error(`[html5-skeleton-core] 不変条件違反（設定: ${config?.name ?? '(名前なし)'}）: ${message}`);
  };
  if (!config || typeof config !== 'object') fail('設定オブジェクトが返されていません');
  if (config.name !== 'uncompressed' && config.name !== 'production') {
    fail(`name は 'uncompressed' または 'production' である必要があります: ${config.name}`);
  }
  if (config.context !== paths.rootDir) {
    fail(`context が rootDir と一致しません: ${config.context}`);
  }
  const outputPath = config.output?.path;
  // path.relativeの結果が「..セグメント」または別ドライブ等の絶対パスならrootDir外
  const rel = outputPath ? path.relative(paths.rootDir, outputPath) : null;
  if (rel === null || rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) {
    fail(`output.path が rootDir 配下にありません: ${outputPath}`);
  }
  if (config.name === 'production') {
    if (!Array.isArray(config.dependencies) || config.dependencies.length !== 1 || config.dependencies[0] !== 'uncompressed') {
      fail(`production の dependencies は ['uncompressed'] である必要があります: ${JSON.stringify(config.dependencies)}`);
    }
    const ignored = config.watchOptions?.ignored;
    const webpGlob = toPosix(path.join(paths.imgToWebpSrcDir, '**/*.webp'));
    if (!Array.isArray(ignored) || !ignored.includes(webpGlob)) {
      fail(`img2webpの標準watch除外（${webpGlob}）が消えています。この除外は .webp 生成による再ビルド連鎖を防ぐ不変条件です`);
    }
    const pluginNames = (config.plugins ?? []).map((p) => p?.constructor?.name);
    const copyIndex = pluginNames.indexOf('CopyPlugin');
    const bsIndex = pluginNames.indexOf('BrowserSyncPlugin');
    if (copyIndex === -1) fail('CopyPlugin が存在しません');
    if (bsIndex === -1) fail('BrowserSyncPlugin が存在しません');
    if (copyIndex > bsIndex) fail('CopyPlugin は BrowserSyncPlugin より前に配置する必要があります');
  }
  return config;
};

const createConfig = (options = {}) => {
  const paths = resolvePaths(options);
  if (!fs.existsSync(paths.srcDir)) {
    throw new Error(`[html5-skeleton-core] srcDir が存在しません: ${paths.srcDir}`);
  }

  // CONTENT_DATAはモジュールトップで共有せず、呼び出しごとに解決済みcontentTextDirから読み込む
  const contentData = loadContentData(paths.contentTextDir);

  const resolvedOptions = {
    ...options,
    stylelint: options.stylelint ?? (process.env.STYLELINT === '1'),
  };

  const configs = [
    createConfig_uncompressed({ paths, contentData, options: resolvedOptions }),
    createConfig_production({ paths, contentData, options: resolvedOptions }),
  ];

  // 用途別オプションで表現できない場合の最終フック。設定ごとに1回呼び、実行後に不変条件を再検証する
  const extendConfig = options.extendConfig;
  return configs.map((config) => {
    const extended = typeof extendConfig === 'function'
      ? extendConfig(config, { name: config.name, paths: { ...paths } })
      : config;
    return assertInvariants(extended, paths);
  });
};

module.exports = createConfig;
