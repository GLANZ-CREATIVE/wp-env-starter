# Repository Guidelines

## 設計作業ルール

設計作業を依頼された場合は、以下のルールに従ってファイルを作成すること：

- ファイル名: `YYYYMMDD_HHMM_{日本語の作業内容}.md`
- 保存場所: `docs/` 以下
- フォーマット: Markdown

例: `docs/20250815_1430_ユーザー認証システム設計.md`

## プロジェクト概要

WordPress + Vite + Docker を使用したローカル開発環境。WordPress テーマの開発に Vite（HMR 対応）と Tailwind CSS v4 を活用し、コンテナベースで PHP とデータベースを管理する。

## 開発環境の起動

### 前提条件

- Docker と Docker Compose が起動していること
- Node.js v22 以上がインストールされていること

### 起動コマンド

```bash
# WordPress + Vite 開発サーバーを同時起動
npm run start

# phpMyAdmin も含めて起動
npm run setup

# 個別起動
npm run wp-env start  # WordPress のみ
npm run dev           # Vite のみ
```

### アクセス URL

- WordPress: `http://localhost:8888`
- WordPress 管理画面: `http://localhost:8888/wp-admin/` (admin / password)
- Vite 開発サーバー: `http://localhost:3000`

### 停止・削除

```bash
npm run stop     # 環境を停止
npm run destroy  # 環境を完全削除（データも削除される）
```

## ビルド・テスト・リント

```bash
npm run build      # 本番用ビルド（theme/dist に出力）
npm run format     # Prettier でフォーマット（PHP, CSS, SCSS, JS, TS）
npm run stylelint  # Stylelint で CSS/SCSS を自動修正
npm run eslint     # ESLint で JS/TS を自動修正
```

## データベース操作

```bash
# バックアップ
npm run backup-db      # Linux/Mac (sql/backup-YYYYMMDD.sql に保存)
npm run backup-db-win  # Windows

# リストア
npm run restore-db ./sql/backup-YYYYMMDD.sql
```

## アーキテクチャ

### Vite とアセット管理の仕組み

- **開発環境（WP_ENVIRONMENT_TYPE=local）**: Vite 開発サーバー（`http://localhost:3000`）から HMR でアセットを配信
- **本番環境**: `theme/dist/.vite/manifest.json` を参照してビルド済みアセットを読み込む
- エントリーポイント: `theme/src/js/main.js`, `theme/src/scss/style.scss`
- `functions.php` の `vite_get_asset_url()` が環境を判定してアセット URL を解決
- WordPress 側は `wp_enqueue_script()` / `wp_enqueue_style()` でアセットをキューに登録

### Tailwind CSS v4 の統合

- **CSS インポート方式**: `theme/src/css/index.css` で `@import "tailwindcss"` を使用（従来の設定ファイルなし）
- **スキャン対象**: `@source "../../../**/*.php"` で PHP テンプレートファイルをスキャン
- **カスタムトークン**: `@theme` ブロック内で CSS 変数として定義（例: `--color-main-500`）
- **PostCSS**: `@tailwindcss/postcss` プラグインで処理
- **Vite**: `@tailwindcss/vite` プラグインで開発サーバーと統合

### WordPress テーマ構造

- `theme/functions.php`: Vite アセット読み込みロジック、HMR 対応
- `theme/index.php`, `theme/front-page.php` 等: テンプレートファイル
- `theme/src/`: ソースファイル（JS, CSS/SCSS, 画像）
- `theme/dist/`: ビルド出力（Git 管理対象外）

### wp-env による環境管理

- `.wp-env.json` で WordPress コア、PHP バージョン、テーマパス、ポート番号を管理
- 日本語版 WordPress を使用（`https://ja.wordpress.org/latest-ja.zip`）
- `theme/dist` と `sql` ディレクトリを Docker コンテナにマッピング
- デバッグモード有効（`WP_DEBUG`, `SCRIPT_DEBUG`）

## GitHub操作ルール

- ユーザーからPRを出して、と言われたときは、現在の作業のフィーチャーブランチを切りコミットを行ってからPRを出すようにする
- developやmainへの直接pushは禁止です
- Prismaのマイグレーションを含む差分は自動デプロイで環境を壊しうるので、ユーザーに許可を取ってから実行してください
- ロジックにまつわる変更をしたあとのPushの前には、プロジェクトルートで　`npm run typecheck` と `npm run lint` を行ってからPushするようにしてください
- PR作成時は `gh pr create` コマンドに `--base` オプションを付けず、デフォルトのベースブランチを使用してください
- コミットメッセージは `feat: ...` `fix: ...` などのプレフィックスと簡潔な英語動詞句を使用し、1 コミット 1 目的を徹底します。
- PR には目的、主要変更点、実行コマンド、影響範囲（テンプレート・スタイル・DB）、スクリーンショットやログを含めます。
- 関連課題は `Closes #<issue>` でリンク。レビュアー向けチェックリスト（ビルド済み・バックアップ済み等）を本文末尾に記載してください。
