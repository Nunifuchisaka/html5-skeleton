'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const { collectHashes } = require('../lib/hash-tree');
const { diffManifest, buildDeliveryNote } = require('../lib/delivery-core');
const { createZipBuffer } = require('../lib/zip');

const TMP_ROOT = path.resolve(__dirname, '../../tmp');

const makeTempDir = (t) => {
  fs.mkdirSync(TMP_ROOT, { recursive: true });
  const dir = fs.mkdtempSync(path.join(TMP_ROOT, 'delivery-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
};

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

test('collectHashes: POSIX相対パスをキーにSHA-256を返し、無視対象を除外する', (t) => {
  const dir = makeTempDir(t);
  fs.mkdirSync(path.join(dir, 'img'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), '<html></html>');
  fs.writeFileSync(path.join(dir, 'img', 'a.webp'), Buffer.from([1, 2, 3]));
  fs.writeFileSync(path.join(dir, '.DS_Store'), 'junk');
  fs.writeFileSync(path.join(dir, 'Thumbs.db'), 'junk');
  const hashes = collectHashes(dir);
  assert.deepEqual(Object.keys(hashes).sort(), ['img/a.webp', 'index.html']);
  assert.equal(hashes['index.html'], sha256(Buffer.from('<html></html>')));
  assert.equal(hashes['img/a.webp'], sha256(Buffer.from([1, 2, 3])));
});

test('collectHashes: 存在しないディレクトリは空オブジェクト', () => {
  assert.deepEqual(collectHashes(path.join(TMP_ROOT, 'no-such-dir-xyz')), {});
});

test('diffManifest: 変更・追加・削除を分類しソートして返す', () => {
  const manifest = { 'a.html': 'hash-a', 'b.css': 'hash-b', 'gone.js': 'hash-gone' };
  const current = { 'a.html': 'hash-a2', 'b.css': 'hash-b', 'new.webp': 'hash-new' };
  const diff = diffManifest(manifest, current);
  assert.deepEqual(diff.changed, ['a.html']);
  assert.deepEqual(diff.added, ['new.webp']);
  assert.deepEqual(diff.deleted, ['gone.js']);
});

test('diffManifest: 差分なしなら全リストが空', () => {
  const same = { 'a.html': 'x' };
  const diff = diffManifest(same, { ...same });
  assert.deepEqual(diff, { changed: [], added: [], deleted: [] });
});

test('buildDeliveryNote: 変更・追加・削除の各一覧と手動削除の注意書きを含む', () => {
  const note = buildDeliveryNote({
    env: 'staging',
    dateLabel: '2026-07-28',
    changed: ['index.html'],
    added: ['img/new.webp'],
    deleted: ['old/legacy.css'],
  });
  assert.ok(note.includes('staging'));
  assert.ok(note.includes('2026-07-28'));
  assert.ok(note.includes('index.html'));
  assert.ok(note.includes('img/new.webp'));
  assert.ok(note.includes('old/legacy.css'));
  assert.ok(note.includes('手動で削除'), '削除ファイルの手動削除案内がある');
});

test('buildDeliveryNote: 該当なしの区分は「なし」と明記される', () => {
  const note = buildDeliveryNote({ env: 'production', dateLabel: '2026-07-28', changed: [], added: [], deleted: [] });
  assert.ok(note.includes('なし'));
});

// createZipBuffer の出力を自前でパースして往復検証する（外部unzipコマンド非依存）
const parseZip = (buf) => {
  const eocdOffset = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.ok(eocdOffset >= 0, 'EOCDが存在する');
  const entryCount = buf.readUInt16LE(eocdOffset + 10);
  let pos = buf.readUInt32LE(eocdOffset + 16);
  const entries = [];
  for (let i = 0; i < entryCount; i++) {
    assert.equal(buf.readUInt32LE(pos), 0x02014b50, 'central directory署名');
    const method = buf.readUInt16LE(pos + 10);
    const crc = buf.readUInt32LE(pos + 16);
    const compSize = buf.readUInt32LE(pos + 20);
    const rawSize = buf.readUInt32LE(pos + 24);
    const nameLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);
    const localOffset = buf.readUInt32LE(pos + 42);
    const name = buf.slice(pos + 46, pos + 46 + nameLen).toString('utf8');
    assert.equal(buf.readUInt32LE(localOffset), 0x04034b50, 'local file署名');
    const localNameLen = buf.readUInt16LE(localOffset + 26);
    const localExtraLen = buf.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    const stored = buf.slice(dataStart, dataStart + compSize);
    const data = method === 8 ? zlib.inflateRawSync(stored) : Buffer.from(stored);
    assert.equal(data.length, rawSize, '展開後サイズが一致する');
    entries.push({ name, data, crc });
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
};

test('createZipBuffer: 書いたzipをパースして名前と内容が往復一致する', () => {
  const files = [
    { name: '_delivery_note.txt', data: Buffer.from('納品メモ\n', 'utf8') },
    { name: 'img/photo1.webp', data: crypto.randomBytes(4096) },
    { name: 'index.html', data: Buffer.from('<html>'.repeat(100), 'utf8') },
  ];
  const zip = createZipBuffer(files);
  const entries = parseZip(zip);
  assert.equal(entries.length, files.length);
  for (const file of files) {
    const entry = entries.find((e) => e.name === file.name);
    assert.ok(entry, `${file.name} がzipに含まれる`);
    assert.deepEqual(entry.data, file.data, `${file.name} の内容が一致する`);
  }
});
