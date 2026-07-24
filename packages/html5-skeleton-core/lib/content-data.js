'use strict';

// src/content/text/site.json（SITE_NAME等）とpages/**/*.json（ページ単位のmeta/本文）を
// まとめて読み込む。createConfig()の呼び出しごとに解決済みcontentTextDirから読み込み、
// モジュールトップの共有状態は持たない（異なるrootDirの連続呼び出しで混ざらないため）。
// JSONは設定生成時に一度だけ読み込まれるため、編集を反映するには npm start の再起動が
// 必要（EJS/SCSS/JSのようなwatchによる自動反映はされない）。これはv1の公開仕様。

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const readJson = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[html5-skeleton-core] content JSONが見つかりません: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`[html5-skeleton-core] content JSONの構文エラー: ${filePath} (${err.message})`);
  }
};

const loadContentData = (contentTextPath) => {
  const siteData = readJson(path.join(contentTextPath, 'site.json'));
  const PAGES = {};
  glob.sync('pages/**/*.json', { cwd: contentTextPath, posix: true }).forEach((key) => {
    const pageKey = key.replace(/^pages\//, '').replace(/\.json$/, '');
    if (Object.prototype.hasOwnProperty.call(PAGES, pageKey)) {
      throw new Error(`[html5-skeleton-core] PAGESキーが重複しています: "${pageKey}" (${path.join(contentTextPath, key)})`);
    }
    PAGES[pageKey] = readJson(path.join(contentTextPath, key));
  });
  return { ...siteData, PAGES };
};

module.exports = { loadContentData };
