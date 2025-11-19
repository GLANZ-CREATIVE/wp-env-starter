# WordPress + Vite + Docker 開発環境

**目次**
Docker、Vite、wp-env を使用して WordPress のローカル開発環境を構築します。  
Ref: [https://github.com/Masahiro-web/simple-wp-dev](https://github.com/Masahiro-web/simple-wp-dev)

- [WordPress + Vite + Docker 開発環境](#wordpress--vite--docker-開発環境)
  - [開発環境側でインストールが必要なもの](#開発環境側でインストールが必要なもの)
  - [セットアップ](#セットアップ)
  - [環境設定](#環境設定)
    - [開発環境](#開発環境)
    - [本番環境](#本番環境)
    - [アセット管理](#アセット管理)
  - [主な npm コマンド](#主な-npm-コマンド)
    - [データベースのバックアップ](#データベースのバックアップ)
    - [データベースのリストア](#データベースのリストア)
  - [ビルド](#ビルド)
  - [ディレクトリ構造](#ディレクトリ構造)
  - [注意事項](#注意事項)

---

- WordPress 環境は `http://localhost:8888` でアクセスできます
  - 管理画面: `http://localhost:8888/wp-admin/`
  - ユーザー名: `admin`
  - パスワード: `password`
- フロントエンドの開発には Vite を使用します（`http://localhost:3000`）
- テーマの変更は `./theme` ディレクトリ内で行います
- ソースファイルは `./theme/src` ディレクトリにあります

## 開発環境側でインストールが必要なもの

- Node.js (v22 以上)
- Docker と Docker Compose
- npm または yarn
- [wp-env](https://github.com/GLANZ-CREATIVE/wp-env-starter)

## セットアップ

環境の起動時に Docker が実行されていることを確認してください。

1. リポジトリをクローン

2. 依存関係のインストール

   ```bash
   npm install
   ```

3. WordPress 環境の起動

   ```bash
   npm run wp-env start
   ```

4. フロントエンド開発サーバーの起動

   ```bash
   npm run dev
   ```

   または、一度に両方を起動

   ```bash
   npm run start
   ```

   phpmyadmin も同時起動する場合

   ```bash
   npm run setup
   ```

## 環境設定

### 開発環境

`.wp-env.json` で開発環境の設定を行います：

- `WP_ENVIRONMENT_TYPE`: `local`（自動的に設定）
- `WP_DEBUG`: `true`（デバッグモード有効）
- `SCRIPT_DEBUG`: `true`（圧縮されていないスクリプトを使用）
- アセットは Vite 開発サーバー（`http://localhost:3000`）から HMR で配信

### 本番環境

本番環境では WordPress の `wp-config.php` ファイルで以下の設定を行います：

```php
// 環境タイプの設定（未設定の場合は production として扱われる）
define("WP_ENVIRONMENT_TYPE", "production");

// デバッグモードを無効化
define("WP_DEBUG", false);
define("SCRIPT_DEBUG", false);
```

**設定手順：**

1. サーバー上の WordPress ルートディレクトリにある `wp-config.php` を編集
2. 上記の設定を追加（既存の設定がある場合は上書き）
3. `npm run build` でビルド済みアセットを生成してからデプロイ
4. アセットは `theme/dist/.vite/manifest.json` から自動的に読み込まれる

**注意：** `.wp-env.json` は開発環境専用のファイルです。本番環境では使用しません。

### アセット管理

- **画像ファイル**: `assets_url('images/example.png')` を使用すると、自動的に Vite の最適化パイプラインを通します
  - 開発環境: Vite dev server (`http://localhost:3000`) から配信
  - 本番環境: ビルド時に最適化された画像を `manifest.json` から読み込み
- **その他のアセット**: `assets_url('css/custom.css')` で `src/assets/` から直接配信
- **テーマルートのファイル**: `public_url('ogp.png')` でテーマルートのファイルを参照

## 主な npm コマンド

- `npm run start` - WordPress 環境と Vite 開発サーバーを同時に起動
- `npm run setup` - WordPress 環境と Vite 開発サーバーを同時に起動（phpmyadmin のコンテナも構築する）
- `npm run wp-env start` - WordPress の Docker 環境のみを起動
- `npm run dev` - Vite 開発サーバーのみを起動
- `npm run stop` - WordPress 環境を停止
- `npm run destroy` - WordPress 環境を完全に削除（データも削除）
- `phpmyadmin:start` - phpmyadmin を起動する
- `phpmyadmin:stop` - phpmyadmin を停止する

### データベースのバックアップ

SQL ファイルとしてデータベースをエクスポートするには、以下のコマンドを使用します。
バックアップファイルは sql ディレクトリに日付付きのファイル名（例: backup-20250519.sql）で保存されます。

```bash
# Linux/Mac環境の場合
npm run backup:db

# Windows環境の場合
npm run backup:db:win
```

### データベースのリストア

バックアップからデータベースを復元するには、以下のコマンドを使用します。

```bash
# 特定のファイルを指定して復元
npm run import:db ./sql/バックアップファイル名.sql

# 例
npm run import:db ./sql/backup-20250519.sql
```

## ビルド

本番環境用にビルドするには、以下のコマンドを実行してください。

```bash
npm run build
```

これにより、`/theme/dist` ディレクトリにビルドされたアセットが生成されます。

## ディレクトリ構造

```plaintext
.
├── theme/                     # WordPressテーマディレクトリ
│   ├── dist/                  # ビルドされたアセット（JS, CSS）
│   ├── src/                   # ソースファイル
│   │   ├── images/            # 画像ファイル（scss内でbackground-image等で指定されたファイルのみ格納する）
│   │   ├── js/                # JavaScriptファイル
│   │   └── scss/              # SCSSファイル
│   │       └── style.scss     # メインのスタイルファイル
│   ├── functions/             # テーマ機能ファイル
│   │   ├── helper.php         # ヘルパー関数
│   │   ├── vite.php           # Vite関連関数
│   │   └── assets.php         # アセット読み込み関連
│   ├── functions.php          # WordPressテーマ機能（各ファイルを読み込み）
│   ├── index.php              # メインテンプレートファイル
│   └── ...                    # その他のテーマファイル
├── sql/                       # データベースバックアップ
│   └── backup-*.sql           # バックアップファイル
├── uploads/                   # アップロードファイル
├── package.json               # npm設定とスクリプト
├── vite.config.js             # Vite設定ファイル
├── tailwind.config.js         # Tailwind CSS設定
├── postcss.config.js          # PostCSS設定
└── .wp-env.json               # WordPress環境設定
```

## 注意事項

- ビルド時に Tailwindcss の記述が dist の css に含まれますが不要な場合は`/src/scss/style.scss`の 1 行目を削除してください。
- `/src/scss/style.scss`で指定された背景画像ファイルは`/src/images/`ディレクトリに格納してください。
