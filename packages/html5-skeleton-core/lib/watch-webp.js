'use strict';

// img2webpステージングディレクトリを監視し、置かれたjpg/jpeg/pngを同ディレクトリ内の
// WebPへ変換し続けるwatcher。webpackビルドとは独立した系統（dist/には出力しない）。

const path = require('path');
const chokidar = require('chokidar');
const { convertFile } = require('./webp');
const IMAGE_OPTIMIZATION_CONFIG = require('../config/image-optimization.config');

const startWatchWebp = ({
  rootDir = process.cwd(),
  imgToWebpSrcDir = IMAGE_OPTIMIZATION_CONFIG.IMG_TO_WEBP_SRC_DIR,
  quality = IMAGE_OPTIMIZATION_CONFIG.WEBP_QUALITY,
} = {}) => {
  const srcPath = path.resolve(rootDir, imgToWebpSrcDir);

  const convert = async (filePath) => {
    try {
      const outPath = await convertFile(filePath, quality);
      console.log(`[webp] 変換しました: ${path.relative(process.cwd(), outPath)}`);
    } catch (err) {
      console.error(`[webp] 変換に失敗しました: ${filePath}`, err);
    }
  };

  const watcher = chokidar
    .watch('**/*.{jpg,jpeg,png}', {
      cwd: srcPath,
      ignoreInitial: false,
    })
    .on('add', (relPath) => convert(path.join(srcPath, relPath)))
    .on('change', (relPath) => convert(path.join(srcPath, relPath)));

  console.log(`[webp] watch開始: ${srcPath}`);
  return watcher;
};

module.exports = { startWatchWebp };
