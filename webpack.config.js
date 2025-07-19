const SRC_DIR = './src/htdocs';
const DIST_DIR = './dist/htdocs'; // 最終的な圧縮版の出力先
const DIST_UNCOMPRESSED_DIR = './dist_uncompressed/htdocs'; // 作業用の中間的な非圧縮版の出力先

const SITE_DATA = {
  START_PATH: '',
  SITE_URL: 'https://example.com/',
  SITE_NAME: 'ダミーサイト名',
};

const BROWSER_SYNC_CONFIG = {
  host: 'localhost',
  port: 3000,
};

const IMAGE_OPTIMIZATION_CONFIG = {
  IMG_TO_WEBP_SRC_DIR: './img2webp',
  WEBP_QUALITY: 90,
};


// --- 以下、webpackの動作設定（通常は編集不要）---
const path = require('path');
const glob = require('glob');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const htmlMinifier = require('html-minifier-terser');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const sharp = require('sharp');
const postcss = require('postcss');
const cssnano = require('cssnano');
const StylelintPlugin = require('stylelint-webpack-plugin');
const SRC_PATH = path.resolve(__dirname, SRC_DIR);
const DIST_PATH = path.resolve(__dirname, DIST_DIR);
const DIST_UNCOMPRESSED_PATH = path.resolve(__dirname, DIST_UNCOMPRESSED_DIR);

/**
 * Webpack設定を生成する関数
 */
const createConfig = ({ outputPath, mode }) => {
  const config = {
    mode: mode,
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
          type: 'asset/resource',
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
    watch: 'production' == mode,
    watchOptions: {
      ignored: [
        '**/node_modules/**',
        '**/.DS_Store',
        '**/Thumbs.db',
       path.resolve(__dirname, IMAGE_OPTIMIZATION_CONFIG.IMG_TO_WEBP_SRC_DIR, '**/*.webp'),
      ],
    },
    target: ['web'],
    resolve: { extensions: ['.js'] },
  };

  if ('production' == mode) {
    // JS
    glob.sync('**/*.js', { cwd: SRC_PATH, ignore: '**/_*.js' }).forEach(key => {
      config.entry[key.replace('.js', '')] = path.resolve(SRC_PATH, key);
    });
    config.module.rules.push({ test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' });
    config.optimization = {
      minimize: true,
      minimizer: [ new TerserPlugin({ extractComments: false }) ],
      splitChunks: {
        cacheGroups: { vendor: { test: /[\\/]node_modules[\\/]/, name: 'assets/js/vendor', chunks: 'all' } }
      }
    };
  }

  if ('development' == mode) {
    // CSS
    glob.sync('**/*.scss', { cwd: SRC_PATH, ignore: '**/_*.scss' }).forEach(key => {
      config.entry[key.replace('.scss', '.css')] = path.resolve(SRC_PATH, key);
    });
    config.module.rules.push({
      test: /\.scss$/,
      use: [ MiniCssExtractPlugin.loader, { loader: 'css-loader', options: { importLoaders: 2 } }, 'postcss-loader', { loader: 'sass-loader', options: { implementation: require('sass'), sassOptions: { outputStyle: 'expanded' } } } ],
    });
    config.plugins.push(new MiniCssExtractPlugin({ filename: '[name]' }));
    config.plugins.push(new StylelintPlugin({ files: [`${SRC_DIR}/**/*.scss`], fix: true }));

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
      use: [ { loader: 'html-loader', options: { sources: false, minimize: false } }, { loader: 'ejs-plain-loader', options: { data: SITE_DATA } } ]
    });
  }
  
  if ('production' == mode) {
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
              ignore: ['**/*.js', '**/.DS_Store', '**/Thumbs.db'],
            },
            transform: async (content, absoluteFrom) => {
              if (absoluteFrom.endsWith('.html')) {
                return await htmlMinifier.minify(content.toString(), {
                  collapseWhitespace: true, removeComments: true, removeRedundantAttributes: true, removeScriptTypeAttributes: true, removeStyleLinkTypeAttributes: true, useShortDoctype: true, minifyJS: true, minifyCSS: true, processScripts: ['application/ld+json'],
                });
              }
              if (absoluteFrom.endsWith('.css')) {
                return (await postcss([cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })]).process(content, { from: undefined })).css;
              }
              return content;
            },
          },
        ]
      }),
      new BrowserSyncPlugin({
        ...BROWSER_SYNC_CONFIG,
        server: { baseDir: [DIST_DIR] },
        files: [ `${DIST_DIR}/**/*.html`, `${DIST_DIR}/**/*.css`, `${DIST_DIR}/**/*.js` ],
      }, { reload: true })
    );
  }

  return config;
};

module.exports = [
  // ① 非圧縮版ビルド (CSSとHTMLのみコンパイル)
  createConfig({
    outputPath: DIST_UNCOMPRESSED_PATH,
    mode: 'development',
  }),
  // ② 圧縮版ビルド (JSのみコンパイル、CSS/HTMLはコピー＆圧縮)
  createConfig({
    outputPath: DIST_PATH,
    mode: 'production',
  }),
];