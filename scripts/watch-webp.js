const path = require('path'),
      chokidar = require('chokidar'),
      sharp = require('sharp'),
      { IMG_TO_WEBP_SRC_DIR, WEBP_QUALITY } = require('../config/image-optimization.config');

const SRC_PATH = path.resolve(__dirname, '..', IMG_TO_WEBP_SRC_DIR);

const convert = async (filePath) => {
  const dir = path.dirname(filePath);
  const name = path.parse(filePath).name;
  const outPath = path.join(dir, `${name}.webp`);
  try {
    await sharp(filePath).webp({ quality: WEBP_QUALITY }).toFile(outPath);
    console.log(`[webp] 変換しました: ${path.relative(process.cwd(), outPath)}`);
  } catch (err) {
    console.error(`[webp] 変換に失敗しました: ${filePath}`, err);
  }
};

chokidar
  .watch('**/*.{jpg,jpeg,png}', {
    cwd: SRC_PATH,
    ignoreInitial: false,
  })
  .on('add', (relPath) => convert(path.join(SRC_PATH, relPath)))
  .on('change', (relPath) => convert(path.join(SRC_PATH, relPath)));

console.log(`[webp] watch開始: ${SRC_PATH}`);
