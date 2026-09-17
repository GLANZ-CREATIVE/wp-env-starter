# WordPress + Vite + Docker 開発環境

wp-env による WordPress テーマ開発環境。HMR、画像圧縮 + WebP 変換、カスタムブロック、メール確認（Mailpit）に対応。

## クイックスタート

```bash
pnpm install
pnpm start     # WordPress + Vite + Mailpit を起動
```

| 用途       | URL                             |
| ---------- | ------------------------------- |
| サイト     | http://localhost:8888           |
| 管理画面   | http://localhost:8888/wp-admin/ |
| Vite       | http://localhost:3000           |
| メール確認 | http://localhost:8025           |

ログインは `admin` / `password`。編集は `theme/` 以下で行い、CSS / JS は HMR、PHP は自動リロードされます。

### 必要なもの

- Docker（起動しておく）
- Node.js v24 以上 / pnpm 12+

> [!NOTE]
> [`mise`](https://mise.jdx.dev/getting-started.html) 利用時は `mise install` で `.mise.toml` の Node / pnpm が入ります。

## よく使うコマンド

| コマンド            | 説明                                 |
| ------------------- | ------------------------------------ |
| `pnpm start`        | WordPress + Vite + Mailpit を起動    |
| `pnpm stop`         | 停止（データは残る）                 |
| `pnpm destroy`      | 完全削除（データも消える）           |
| `pnpm build`        | 本番用ビルド（`theme/dist/` に出力） |
| `pnpm lint`         | prettier / stylelint / eslint        |
| `pnpm dev`          | Vite だけ起動                        |
| `pnpm wp-env start` | WordPress だけ起動                   |

> [!NOTE]
> push 前に `pnpm lint` を実行してください。

### データベース

```bash
pnpm backup:db                        # sql/backup-YYYYMMDD.sql に保存（Windows は backup:db:win）
pnpm import:db ./sql/backup-XXXX.sql  # リストア
```

## アセットの書き方

ソースは `theme/src/assets/`。

- **共通 CSS**: `css/index.css` に `@import` を追加
- **ページ別 CSS**: `css/pages/` に置けば自動でエントリ化され、テンプレートから 1 行で読み込めます

  ```php
  // front-page.php
  vite_enqueue_page_style("front-page", "assets/css/pages/front-page.css");
  ```

- **JS**: エントリは `js/main.js`
- **画像（PHP）**: `assets_url('images/example.png')`
- **画像（CSS）**: 絶対パス・相対パスどちらでも解決されます

  ```css
  background-image: url("/assets/images/example.png"); /* theme/src/ 起点 */
  background-image: url("../../images/example.png");
  ```

  PNG / JPEG / TIFF は元の拡張子のまま書けば、ビルド時にハッシュ付きの `.webp` へ変換され参照も書き換わります。`.webp` の直接参照も可。

- **テーマ直下のファイル**: `public_url('ogp.png')`

> [!NOTE]
> 詳細は [functions/vite.php](theme/functions/vite.php) と [functions/assets.php](theme/functions/assets.php) を参照。

## Tailwind CSS を導入する

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

`vite.config.js` にプラグインを追加:

```js
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
});
```

`theme/src/assets/css/index.css`:

```css
@import "tailwindcss";
@source "../../.."; /* theme/ 配下の PHP / JS をスキャン */
```

最後に `pnpm dev` で Vite を再起動します（`pnpm add` 後は必須）。

## カスタムブロック

[theme/blocks/](theme/blocks/) に置くと PHP が自動で検出・登録します。

```bash
pnpm blocks:new <block-name>   # 雛形を生成（小文字とハイフンのみ）
pnpm blocks:build              # 一括ビルド（pnpm build からも実行される）
```

詳細は [theme/blocks/README.md](theme/blocks/README.md) を参照。

## WordPress 本体のバージョン

`.wp-env.json` の `core` は日本語版 7.0 系を指します。パッチ番号なしの URL なので最新パッチが自動で使われます。

```json
"core": "https://ja.wordpress.org/wordpress-7.0-ja.zip"
```

本体はキャッシュされるため、新しいパッチの取り込みには `--update` が必要です。メジャーバージョンを上げるときは URL の `7.0` を書き換えます。

```bash
pnpm wp-env start --update
```

## プラグイン

`.wp-env.json` の `plugins` に並べた zip が起動時に自動でインストール・有効化されます。標準では [WP Multibyte Patch](https://ja.wordpress.org/plugins/wp-multibyte-patch/) が入ります。

```json
"plugins": ["https://downloads.wordpress.org/plugin/wp-multibyte-patch.latest-stable.zip"]
```

開発環境用の設定なので、本番には別途インストールしてください。

## 本番デプロイ

1. `pnpm build` でアセットを生成してデプロイ（`.wp-env.json` は不要）
2. 本番の `wp-config.php` でデバッグを無効化

   ```php
   define("WP_ENVIRONMENT_TYPE", "production");
   define("WP_DEBUG", false);
   define("SCRIPT_DEBUG", false);
   ```

アセットは `theme/dist/.vite/manifest.json` から自動解決されます。

## ディレクトリ構造

```plaintext
.
├── theme/                  # WordPress テーマ
│   ├── blocks/             # カスタムブロック（自動登録）
│   ├── dist/               # ビルド成果物（Git 管理外）
│   ├── functions/          # テーマ機能（assets / blocks / vite など）
│   ├── src/assets/         # CSS / JS / 画像のソース
│   │   ├── css/pages/      # ページ別スタイル
│   │   └── css/index.css   # 共通 CSS（Tailwind エントリ）
│   ├── functions.php
│   ├── front-page.php / header.php / footer.php / index.php
│   └── style.css / theme.json
├── mu-plugins/
├── sql/                    # DB バックアップ
├── uploads/
├── .wp-env.json            # wp-env 設定（開発専用）
├── docker-compose.mailpit.yml
└── vite.config.js
```

## トラブルシューティング

- **テーマが「theme」と表示される**
  テーマフォルダ名が CI/CD 前提で `theme` 固定のためです。別名のテーマで取った DB を入れると有効テーマがずれるので、管理画面から再設定してください。

- **テーマフォルダ名を変えたい**
  `.wp-env.json` の `themes` と `mappings` が `./theme` にハードコードされています。両方を合わせて変更してください。
