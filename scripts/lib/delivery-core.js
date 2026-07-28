'use strict';

// 差分納品のコアロジック（純粋関数のみ）。I/Oは scripts/delivery.js 側で行う。

// マニフェスト（基準）と現在のハッシュ一覧を比較し、変更・追加・削除に分類する
const diffManifest = (manifest, current) => {
  const manifestKeys = Object.keys(manifest);
  const currentKeys = Object.keys(current);
  return {
    changed: manifestKeys.filter((key) => key in current && manifest[key] !== current[key]).sort(),
    added: currentKeys.filter((key) => !(key in manifest)).sort(),
    deleted: manifestKeys.filter((key) => !(key in current)).sort(),
  };
};

const formatList = (files) => (files.length === 0 ? '  （なし）' : files.map((file) => `  ${file}`).join('\n'));

// zipに同梱する _delivery_note.txt の本文を組み立てる
const buildDeliveryNote = ({ env, dateLabel, changed, added, deleted }) => [
  `納品差分メモ（${env}）`,
  `生成日: ${dateLabel}`,
  `基準マニフェスト: delivery/manifest.${env}.json`,
  '',
  'パスはすべて htdocs/ からの相対パス。',
  '',
  `■ 変更ファイル（${changed.length}件）… サーバーの同パスへ上書きアップロードする`,
  formatList(changed),
  '',
  `■ 追加ファイル（${added.length}件）… サーバーの同パスへ新規アップロードする`,
  formatList(added),
  '',
  `■ 削除されたファイル（${deleted.length}件）… FTP手上げでは自動で消えないため、サーバー側から手動で削除すること`,
  formatList(deleted),
  '',
].join('\n');

module.exports = { diffManifest, buildDeliveryNote };
