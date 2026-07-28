# 差分納品の手順（ハッシュマニフェスト方式）

対象読者：この雛形（またはその複製案件）で、FTP手上げによる差分納品を行う人。

## 仕組みの概要

- `dist/` はGit追跡対象外（`.gitignore` の `/dist/`）。「前回何を納品したか」はGitの差分ではなく、`delivery/` 配下のハッシュマニフェストで管理する。
- `delivery/manifest.staging.json` / `delivery/manifest.production.json`（Git管理対象）が、環境ごとに「前回納品時点の `dist/htdocs` 全ファイルのSHA-256一覧」を保持する。
- フォーマットは `{ "htdocsからの相対パス": "sha256" }` のフラットなJSONで、`scripts/hash-dist.js`（core移行検証用）とハッシュ収集の実装（`scripts/lib/hash-tree.js`）を共有している。

## 納品のながれ

### 1. 差分zipを作る

```bash
npm run delivery:diff:staging      # staging向け
npm run delivery:diff:production   # production向け
```

実行すると次の順で処理される。

1. `build:once` 相当のフルビルドで `dist/` を再生成する
2. `dist/htdocs` の全ファイルを該当マニフェストと照合し、変更・追加・削除を判定する
3. 変更・追加ファイルを htdocs のディレクトリ構造のまま `release/<環境名>_YYYYMMDD/` に集める
4. `release/<環境名>_YYYYMMDD.zip` を生成する。zipには `_delivery_note.txt` を同梱する
5. **マニフェストは更新しない**（納品が確定するまで基準を動かさないため）

差分がひとつも無い場合はzipを作らず終了する。

### 2. `_delivery_note.txt` を確認してアップロードする

`_delivery_note.txt` には次の3つの一覧が入っている。

- 変更ファイル … サーバーの同パスへ上書きアップロード
- 追加ファイル … サーバーの同パスへ新規アップロード
- **削除されたファイル … FTP手上げでは自動で消えないため、サーバー側から手動で削除する**（消し忘れ防止のため必ず確認する）

### 3. 納品確定後にマニフェストを更新する

納品が受領・確定したら、該当環境のマニフェストを手動で更新する。

```bash
npm run delivery:baseline:staging      # staging向け
npm run delivery:baseline:production   # production向け
```

現在の `dist/htdocs` のハッシュでマニフェストを上書きし、次回の差分の基準になる。更新したマニフェストはコミットする。

## 注意

- `delivery:baseline` は納品確定後に人間が判断して実行する運用。自動では走らない。
- `release/` はgitignore済み。過去のzipを残したい場合は別の場所に退避する。
- zip生成は依存パッケージ無しの自前実装（`scripts/lib/zip.js`。deflate圧縮・UTF-8ファイル名対応、ZIP64非対応）。スクリプトの単体テストは `npm run test:delivery` で実行できる。
