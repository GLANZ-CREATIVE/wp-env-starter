# WordPress + Vite + Docker 開発環境

Docker・Vite・wp-env で動く WordPress テーマ開発環境です。HMR、画像圧縮+WebP変換、カスタムブロック、メール確認（Mailpit）に対応しています。

## クイックスタート

```bash
pnpm install   # 依存関係をインストール
pnpm start     # WordPress + Vite + Mailpit をまとめて起動
```

起動したら:

| 用途       | URL                             |
| ---------- | ------------------------------- |
| サイト     | http://localhost:8888           |
| 管理画面   | http://localhost:8888/wp-admin/ |
| Vite       | http://localhost:3000           |
| メール確認 | http://localhost:8025           |

管理画面のログインは `admin` / `password` です。

テーマの編集は `theme/` 以下で行います。CSS / JS は保存すると HMR で即反映、PHP は自動リロードされます。

### 必要なもの

- Docker（起動しておく）
- Node.js v24 以上 / pnpm 11+

> Node のバージョンが古い場合は `mise use -g node@24` などで切り替えてください。

## よく使うコマンド

| コマンド            | 説明                                   |
| ------------------- | -------------------------------------- |
| `pnpm start`        | WordPress + Vite + Mailpit を起動      |
| `pnpm stop`         | 停止（データは残る）                   |
| `pnpm destroy`      | 環境を完全削除（データも消える）       |
| `pnpm build`        | 本番用ビルド（`theme/dist/` に出力）   |
| `pnpm lint`         | format / stylelint / eslint / php lint |
| `pnpm dev`          | Vite だけ起動                          |
| `pnpm wp-env start` | WordPress だけ起動                     |

> push する前に `pnpm lint` を実行してください。

### データベース

```bash
pnpm backup:db                        # sql/backup-YYYYMMDD.sql に保存（Windows は backup:db:win）
pnpm import:db ./sql/backup-XXXX.sql  # リストア
```

## アセットの書き方

エントリは `theme/src/assets/` にあります。

- **CSS**: 全ページ共通は `css/index.css` に `@import` を追加。レイヤー順は `reset → theme`
  - デザイントークンとベーススタイルは `css/base/theme.css` に書く
  - リセット（`css/base/reset.css`）は編集しない
- **ページ別 CSS**: `css/pages/` に置き、テンプレートで 1 行呼ぶだけ（自動でエントリ化されます）

  ```php
  // front-page.php
  vite_enqueue_page_style('front-page', 'assets/css/pages/front-page.css');
  ```

- **JS**: エントリは `js/main.js`
- **画像**: `assets_url('images/example.png')` で参照。ビルド時に自動で WebP 変換・圧縮されます
- **テーマ直下のファイル**: `public_url('ogp.png')`

> 仕組みの詳細は [functions/vite.php](theme/functions/vite.php) と [functions/assets.php](theme/functions/assets.php) を参照。

## カスタムブロック

ブロックは [theme/blocks/](theme/blocks/) に置くと、PHP が自動で検出・登録します。

```bash
pnpm blocks:new <block-name>   # 雛形を生成（小文字とハイフンのみ）
pnpm blocks:build              # 一括ビルド（pnpm build からも自動実行）
```

詳しくは [theme/blocks/README.md](theme/blocks/README.md) を参照してください。

## 本番デプロイ

1. `pnpm build` でアセットを生成してデプロイ（`.wp-env.json` は開発専用なので不要）
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
│   │   ├── css/base/       # reset（編集不可）+ theme（トークン）
│   │   ├── css/pages/      # ページ別スタイル
│   │   └── css/index.css   # 共通 CSS のエントリ
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

- **プラグインで DB を移行するとテーマ名が「theme」になる**
  CI/CD デプロイを前提にしているためです。移行後に管理画面からテーマを再設定してください。

- **テーマフォルダ名を変えたい**
  `.wp-env.json` の `themes` と `mappings` が `./theme` にハードコードされています。両方を合わせて変更してください。
