'use strict';

// WebP変換の共有ロジック。sharpはネイティブバイナリを含むため、モジュールトップでは
// 読み込まず、変換を実行した時点で遅延requireする（読み込み失敗時は環境情報と
// 再インストール手順を含むエラーを出す）。

const path = require('path');

let sharpInstance = null;

const loadSharp = () => {
  if (!sharpInstance) {
    try {
      sharpInstance = require('sharp');
    } catch (err) {
      throw new Error(
        `[html5-skeleton-core] sharpの読み込みに失敗しました（platform=${process.platform}, arch=${process.arch}）。` +
        `optional dependenciesを無効化せずに「npm install --include=optional sharp」で再インストールしてください。` +
        `元エラー: ${err.message}`
      );
    }
  }
  return sharpInstance;
};

// Buffer入力をWebPのBufferへ変換する（webpack CopyPluginのtransform用）
const convertBuffer = async (content, quality) => {
  return await loadSharp()(content).webp({ quality }).toBuffer();
};

// ファイル入力を同ディレクトリの<name>.webpへ変換する（watch CLI用）。出力パスを返す。
const convertFile = async (filePath, quality) => {
  const dir = path.dirname(filePath);
  const name = path.parse(filePath).name;
  const outPath = path.join(dir, `${name}.webp`);
  await loadSharp()(filePath).webp({ quality }).toFile(outPath);
  return outPath;
};

module.exports = { convertBuffer, convertFile };
