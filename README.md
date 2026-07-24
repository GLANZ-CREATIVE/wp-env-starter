# WordPress + Vite + Docker 開発環境

Docker、Vite、wp-env を使用した WordPress テーマのローカル開発環境。素の CSS（`@layer` ベース）、HMR、カスタムブロック（pnpm workspace）に対応しています。

**目次**

- [WordPress + Vite + Docker 開発環境](#wordpress--vite--docker-開発環境)
  - [前提条件](#前提条件)
  - [セットアップ](#セットアップ)
  - [環境設定](#環境設定)
    - [開発環境](#開発環境)
    - [本番環境](#本番環境)
    - [アセット管理](#アセット管理)
  - [主な pnpm コマンド](#主な-pnpm-コマンド)
    - [起動・停止](#起動停止)
    - [ビルド](#ビルド)
    - [Lint / Format](#lint--format)
    - [データベースのバックアップ](#データベースのバックアップ)
    - [データベースのリストア](#データベースのリストア)
  - [カスタムブロック](#カスタムブロック)
    - [新規ブロックの雛形生成](#新規ブロックの雛形生成)
  - [メール送信（Mailpit）](#メール送信mailpit)
  - [ディレクトリ構造](#ディレクトリ構造)
  - [トラブルシューティング](#トラブルシューティング)

## 前提条件

- Docker が起動していること
- Node.js v24 以上
- pnpm 11.17.0

mise 利用時: バージョンが異なる場合は `mise install` で指定版を取得し、`mise shell`（一時）または `mise use -g node@24`（グローバル）で有効化。`node -v` で反映を確認。

## セットアップ

1. リポジトリをクローン

2. 依存関係のインストール

   ```bash
   pnpm install
   ```

3. WordPress + Vite 開発サーバーを同時に起動

   ```bash
   pnpm start
   ```

   個別起動:

   ```bash
   pnpm wp-env start  # WordPress のみ
   pnpm dev           # Vite のみ
   ```

## 環境設定

### 開発環境

`.wp-env.json` で開発環境の設定を行います。

- WordPress: `http://localhost:8888`
  - 管理画面: `http://localhost:8888/wp-admin/`
  - ユーザー名: `admin`
  - パスワード: `password`
- Vite 開発サーバー: `http://localhost:3000`
- テーマの変更は `./theme` ディレクトリ内で行う
- `WP_ENVIRONMENT_TYPE`: `local`（自動設定）
- `WP_DEBUG` / `SCRIPT_DEBUG`: `true`
- アセット配信は Vite の生死で自動切替
  - Vite 起動中（`pnpm start` / `pnpm dev`）: HMR で配信
  - Vite 停止中: `pnpm build` 済みの `theme/dist` を配信（本番相当の確認）
- PHP ファイル変更時は vite-plugin-full-reload でブラウザが自動リロード

本番ビルドの見え方をローカルで確認する例:

```bash
pnpm build
pnpm wp-env start   # Vite なし → dist（WebP など）を使用
```

開発に戻すときは `pnpm start`（または別ターミナルで `pnpm dev`）すればよい。`.wp-env.json` の変更は不要。

### 本番環境

本番環境では WordPress の `wp-config.php` で以下を設定します。

```php
// 環境タイプ（未設定なら production として扱われる）
define("WP_ENVIRONMENT_TYPE", "production");

// デバッグモードを無効化
define("WP_DEBUG", false);
define("SCRIPT_DEBUG", false);
```

**手順**

1. サーバー上の `wp-config.php` を編集して上記を追記
2. `pnpm build` でビルド済みアセットを生成してデプロイ
3. アセットは `theme/dist/.vite/manifest.json` から自動的に解決される

**注意:** `.wp-env.json` は開発環境専用で、本番環境では使用しません。

### アセット管理

- **エントリポイント**
  - フロント: `theme/src/assets/js/main.js`、`theme/src/assets/css/index.css`
- **CSS 構成**: 素の CSS。レイヤー順は `reset → theme`
  - リセットは [reset.css](theme/src/assets/css/base/reset.css)（kiso.css、編集不可）
  - トークンとベーススタイルは [theme.css](theme/src/assets/css/base/theme.css)（`@layer theme`）に集約
  - 新規 CSS ファイルは [index.css](theme/src/assets/css/index.css) に `@import` を追記する（自動集約しない）
- **画像**: `assets_url('images/example.png')` で Vite の最適化パイプラインを通す
  - Vite 起動中: Vite dev server から元画像を配信
  - Vite 停止中 / 本番: PNG / JPEG / TIFF を WebP に変換し、圧縮したうえで `manifest.json` から解決（参照パスの拡張子は元のままでよい）
- **その他のアセット**: `assets_url('css/custom.css')` で `src/assets/` から直接配信
- **テーマルートのファイル**: `public_url('ogp.png')` で参照

環境判定とアセット URL 解決は [theme/functions/vite.php](theme/functions/vite.php) と [theme/functions/assets.php](theme/functions/assets.php) を参照してください。

## 主な pnpm コマンド

### 起動・停止

| コマンド                                   | 説明                                       |
| ------------------------------------------ | ------------------------------------------ |
| `pnpm start`                               | WordPress + Vite + Mailpit を同時起動      |
| `pnpm wp-env start`                        | WordPress（Docker）のみ起動                |
| `pnpm dev`                                 | Vite 開発サーバーのみ起動                  |
| `pnpm stop`                                | WordPress と Mailpit を停止                |
| `pnpm destroy`                             | WordPress 環境を完全削除（データも消える） |
| `pnpm mailpit:start` / `pnpm mailpit:stop` | Mailpit 単体の起動 / 停止                  |

### ビルド

```bash
pnpm build
```

`blocks:build`（カスタムブロックビルド）→ `vite build` の順に実行され、`theme/dist/` に成果物が出力されます。

### Lint / Format

| コマンド         | 説明                                                  |
| ---------------- | ----------------------------------------------------- |
| `pnpm lint`      | format / stylelint / eslint / php lint をまとめて実行 |
| `pnpm format`    | Prettier で整形（PHP / CSS / JS / TS）                |
| `pnpm stylelint` | Stylelint で CSS を自動修正                           |
| `pnpm eslint`    | ESLint で JS / TS を自動修正                          |

ロジックに関わる変更を push する前に `pnpm lint` を必ず実行してください。

### データベースのバックアップ

`sql/` ディレクトリに日付付きファイル（例: `backup-20260428.sql`）として保存されます。

```bash
# Linux / Mac
pnpm backup:db

# Windows
pnpm backup:db:win
```

### データベースのリストア

```bash
pnpm import:db ./sql/backup-20260428.sql
```

## カスタムブロック

カスタムブロックは [theme/blocks/](theme/blocks/) 配下に配置し、各ブロックを独立した pnpm workspace パッケージとして管理します。

- 各ブロックは `@wordpress/scripts` でビルドされ、`build/` に出力
- [theme/functions/blocks.php](theme/functions/blocks.php) が `glob()` で自動検出・登録
- 一括ビルドは `pnpm blocks:build`（`pnpm build` から自動で呼ばれる）

### 新規ブロックの雛形生成

```bash
pnpm blocks:new <block-name>
```

`theme/blocks/<block-name>/` 配下に `block.json` / `package.json` / `src/index.js` / `src/edit.js` / `src/save.js` を自動生成します。ブロック名は小文字とハイフンのみ使用できます。

生成後は `pnpm install && pnpm blocks:build` を実行して workspace を更新してください。

## メール送信（Mailpit）

- Mailpit UI: `http://localhost:8025`
- SMTP: `localhost:1025`（コンテナ内からは `host.docker.internal:1025`）
- `pnpm start` で自動起動、`pnpm stop` で停止
- テスト送信: WordPress 管理画面のテストメール、または `pnpm wp-env run cli wp mail test`

## ディレクトリ構造

```plaintext
.
├── theme/                       # WordPress テーマ
│   ├── blocks/                  # カスタムブロック（pnpm workspace）
│   ├── dist/                    # ビルド成果物（Git 管理外）
│   ├── functions/               # テーマ機能
│   │   ├── assets.php           # アセット URL ヘルパー
│   │   ├── blocks.php           # ブロック自動登録
│   │   ├── helper.php           # ヘルパー関数
│   │   └── vite.php             # Vite / HMR 対応
│   ├── src/
│   │   └── assets/
│   │       ├── css/             # 素の CSS（@layer: reset / theme）
│   │       │   ├── base/
│   │       │   │   ├── reset.css       # kiso.css（編集不可）
│   │       │   │   └── theme.css       # トークン + ベーススタイル
│   │       │   ├── pages/             # ページ固有スタイル（任意）
│   │       │   └── index.css          # フロント用エントリ
│   │       ├── images/
│   │       └── js/
│   │           ├── main.js      # JS エントリ
│   │           ├── images.js
│   │           └── modules/
│   ├── functions.php            # 各 functions/*.php を読み込み
│   ├── front-page.php
│   ├── header.php / footer.php / index.php
│   ├── style.css
│   └── theme.json
├── mu-plugins/
├── sql/                         # DB バックアップ
├── uploads/
├── .wp-env.json                 # wp-env 設定
├── docker-compose.mailpit.yml
├── eslint.config.mjs
├── lefthook.yml                 # Git hooks
├── package.json / pnpm-workspace.yaml
└── vite.config.js
```

## トラブルシューティング

- **プラグインで DB の移行をしたときに「theme」というテーマに設定されてしまう**
  CI/CD を通じてデプロイされることを想定しているため、プラグインで DB を移行するとテーマ名が「theme」になります。移行後は管理画面からテーマを再設定してください。

- **テーマフォルダ名を変更した場合**
  `.wp-env.json` の `themes` と `mappings` のパスは `./theme` にハードコードされています。フォルダ名を変更する場合は両箇所を合わせて変更してください。
