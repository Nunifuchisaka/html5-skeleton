'use strict';

// 差分納品スクリプト（ハッシュマニフェスト方式・環境別）。
//   node scripts/delivery.js diff <staging|production>
//     … build:once相当でdistを再生成し、dist/htdocs を delivery/manifest.<env>.json と照合。
//       変更・追加ファイルを htdocs 構造のまま release/<env>_YYYYMMDD/ に集め、
//       _delivery_note.txt（変更・追加・削除の一覧）と共に release/<env>_YYYYMMDD.zip を作る。
//       マニフェストは更新しない。
//   node scripts/delivery.js baseline <staging|production>
//     … 現在の dist/htdocs のハッシュで delivery/manifest.<env>.json を上書きする。
//       納品確定後に手動で実行する運用。

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const { collectHashes } = require('./lib/hash-tree');
const { diffManifest, buildDeliveryNote } = require('./lib/delivery-core');
const { createZipBuffer } = require('./lib/zip');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const HTDOCS_DIR = path.join(PROJECT_ROOT, 'dist', 'htdocs');
const DELIVERY_DIR = path.join(PROJECT_ROOT, 'delivery');
const RELEASE_DIR = path.join(PROJECT_ROOT, 'release');
const ENVS = ['staging', 'production'];

const manifestPath = (env) => path.join(DELIVERY_DIR, `manifest.${env}.json`);

const formatDate = (date, separator) =>
  [
    String(date.getFullYear()),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join(separator);

const writeManifest = (env, hashes) => {
  fs.mkdirSync(DELIVERY_DIR, { recursive: true });
  fs.writeFileSync(manifestPath(env), `${JSON.stringify(hashes, null, 2)}\n`);
};

const runBuildOnce = () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'build-once.js')], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    console.error('[delivery] ビルドに失敗したため中断します');
    process.exit(result.status ?? 1);
  }
};

const runDiff = (env) => {
  if (!fs.existsSync(manifestPath(env))) {
    console.error(`[delivery] マニフェストがありません: ${path.relative(PROJECT_ROOT, manifestPath(env))}`);
    console.error(`先に npm run delivery:baseline:${env} で基準を作成してください。`);
    process.exit(2);
  }
  runBuildOnce();
  const manifest = JSON.parse(fs.readFileSync(manifestPath(env), 'utf-8'));
  const current = collectHashes(HTDOCS_DIR);
  const { changed, added, deleted } = diffManifest(manifest, current);

  if (changed.length === 0 && added.length === 0 && deleted.length === 0) {
    console.log(`[delivery] ${env}: マニフェストとの差分はありません。zipは作成しません。`);
    return;
  }

  const now = new Date();
  const stageName = `${env}_${formatDate(now, '')}`;
  const stageDir = path.join(RELEASE_DIR, stageName);
  const zipPath = path.join(RELEASE_DIR, `${stageName}.zip`);

  // 同日再実行時に前回の残骸が混ざらないよう作り直す（dist/には触らない）
  fs.rmSync(stageDir, { recursive: true, force: true });

  const note = buildDeliveryNote({ env, dateLabel: formatDate(now, '-'), changed, added, deleted });
  const uploadFiles = [...changed, ...added].sort();

  const zipEntries = [{ name: '_delivery_note.txt', data: Buffer.from(note, 'utf8'), date: now }];
  for (const relPath of uploadFiles) {
    const srcPath = path.join(HTDOCS_DIR, ...relPath.split('/'));
    const destPath = path.join(stageDir, ...relPath.split('/'));
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    zipEntries.push({ name: relPath, data: fs.readFileSync(srcPath), date: now });
  }
  fs.writeFileSync(path.join(stageDir, '_delivery_note.txt'), note);
  fs.writeFileSync(zipPath, createZipBuffer(zipEntries));

  console.log(note);
  console.log(`[delivery] ${env}: 変更${changed.length}件 / 追加${added.length}件 / 削除${deleted.length}件`);
  console.log(`[delivery] 納品ファイル一式: ${path.relative(PROJECT_ROOT, stageDir)}/`);
  console.log(`[delivery] 納品zip: ${path.relative(PROJECT_ROOT, zipPath)}`);
  console.log('[delivery] マニフェストは更新していません。納品確定後に delivery:baseline を実行してください。');
};

const runBaseline = (env) => {
  if (!fs.existsSync(HTDOCS_DIR)) {
    console.error(`[delivery] dist/htdocs がありません。先に npm run build:once を実行してください。`);
    process.exit(2);
  }
  const hashes = collectHashes(HTDOCS_DIR);
  writeManifest(env, hashes);
  console.log(`[delivery] ${env}: マニフェストを更新しました（${Object.keys(hashes).length}ファイル）: ${path.relative(PROJECT_ROOT, manifestPath(env))}`);
};

const [mode, env] = process.argv.slice(2);
if (!ENVS.includes(env) || (mode !== 'diff' && mode !== 'baseline')) {
  console.error('使い方: node scripts/delivery.js <diff|baseline> <staging|production>');
  process.exit(2);
}
if (mode === 'diff') {
  runDiff(env);
} else {
  runBaseline(env);
}
