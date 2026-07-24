'use strict';

// dist/ と dist_uncompressed/ の全ファイルのSHA-256を記録・照合する。
// core切り出しの前後でビルド成果物がバイト単位で同一であることの検証に使う。
//   node scripts/hash-dist.js baseline  … 現状のハッシュを tmp/core-migration-baseline.json に保存
//   node scripts/hash-dist.js verify    … 現状のハッシュをbaselineと照合し、差分があればexit 1

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TARGET_DIRS = ['dist', 'dist_uncompressed'];
const IGNORE_BASENAMES = new Set(['.DS_Store', 'Thumbs.db']);
const BASELINE_PATH = path.join(PROJECT_ROOT, 'tmp', 'core-migration-baseline.json');

const collectHashes = () => {
  const hashes = {};
  const walk = (absDir, relDir) => {
    for (const entry of fs.readdirSync(absDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (IGNORE_BASENAMES.has(entry.name)) continue;
      const absPath = path.join(absDir, entry.name);
      const relPath = `${relDir}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(absPath, relPath);
      } else if (entry.isFile()) {
        hashes[relPath] = crypto.createHash('sha256').update(fs.readFileSync(absPath)).digest('hex');
      }
    }
  };
  for (const dir of TARGET_DIRS) {
    const absDir = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(absDir)) walk(absDir, dir);
  }
  return hashes;
};

const mode = process.argv[2];

if (mode === 'baseline') {
  const hashes = collectHashes();
  fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(hashes, null, 2));
  console.log(`[hash-dist] baseline保存: ${path.relative(PROJECT_ROOT, BASELINE_PATH)} (${Object.keys(hashes).length}ファイル)`);
} else if (mode === 'verify') {
  if (!fs.existsSync(BASELINE_PATH)) {
    console.error(`[hash-dist] baselineがありません: ${BASELINE_PATH}。先に npm run hash:baseline を実行してください。`);
    process.exit(2);
  }
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
  const current = collectHashes();
  const baselineKeys = Object.keys(baseline);
  const currentKeys = Object.keys(current);
  const missing = baselineKeys.filter((key) => !(key in current));
  const added = currentKeys.filter((key) => !(key in baseline));
  const changed = baselineKeys.filter((key) => key in current && baseline[key] !== current[key]);
  for (const key of missing) console.log(`MISSING  ${key}`);
  for (const key of added) console.log(`ADDED    ${key}`);
  for (const key of changed) console.log(`CHANGED  ${key}`);
  if (missing.length || added.length || changed.length) {
    console.error(`[hash-dist] 不一致: missing=${missing.length} added=${added.length} changed=${changed.length} (照合対象 ${baselineKeys.length}ファイル)`);
    process.exit(1);
  }
  console.log(`[hash-dist] 一致: ${baselineKeys.length}ファイルすべて同一`);
} else {
  console.error('使い方: node scripts/hash-dist.js <baseline|verify>');
  process.exit(2);
}
