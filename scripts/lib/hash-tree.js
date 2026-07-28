'use strict';

// ディレクトリ配下の全ファイルのSHA-256を収集する共通ロジック。
// scripts/hash-dist.js（成果物同一性検証）と scripts/delivery.js（差分納品）で共用する。

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IGNORE_BASENAMES = new Set(['.DS_Store', 'Thumbs.db']);

// absDir配下を再帰的に辿り、{ POSIX相対パス: sha256hex } を返す。
// ディレクトリごとに名前順（localeCompare）で処理するため、結果の挿入順は決定的。
const collectHashes = (absDir) => {
  const hashes = {};
  const walk = (currentDir, relDir) => {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (IGNORE_BASENAMES.has(entry.name)) continue;
      const absPath = path.join(currentDir, entry.name);
      const relPath = relDir === '' ? entry.name : `${relDir}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(absPath, relPath);
      } else if (entry.isFile()) {
        hashes[relPath] = crypto.createHash('sha256').update(fs.readFileSync(absPath)).digest('hex');
      }
    }
  };
  if (fs.existsSync(absDir)) walk(absDir, '');
  return hashes;
};

module.exports = { collectHashes, IGNORE_BASENAMES };
