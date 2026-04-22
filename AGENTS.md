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
- Node.js v24 以上がインストールされていること
- pnpm 10.33.0（corepack 経由で有効化）
- Composer（PHPCS 用）

### 起動コマンド

```bash
# WordPress + Vite 開発サーバーを同時起動
pnpm start

# phpMyAdmin も含めて起動
pnpm setup

# 個別起動
pnpm wp-env start  # WordPress のみ
pnpm dev           # Vite のみ
```

### アクセス URL

- WordPress: `http://localhost:8888`
- WordPress 管理画面: `http://localhost:8888/wp-admin/` (admin / password)
- Vite 開発サーバー: `http://localhost:3000`

### 停止・削除

```bash
pnpm stop     # 環境を停止
pnpm destroy  # 環境を完全削除（データも削除される）
```

## ビルド・テスト・リント

```bash
pnpm build      # 本番用ビルド（ブロック → 画像生成 → Vite ビルド）
pnpm lint       # 全リントチェック（format, stylelint, eslint, php）
pnpm format     # Prettier でフォーマット（PHP, CSS, JS, TS）
pnpm stylelint  # Stylelint で CSS を自動修正
pnpm eslint     # ESLint で JS/TS を自動修正
pnpm php:cs     # PHPCS で WordPress コーディング標準チェック
pnpm php:cs:fix # PHPCBF で自動修正
```

## データベース操作

```bash
# バックアップ
pnpm backup:db      # Linux/Mac (sql/backup-YYYYMMDD.sql に保存)
pnpm backup:db:win  # Windows

# リストア
pnpm import:db ./sql/backup-YYYYMMDD.sql
```

## アーキテクチャ

### Vite とアセット管理の仕組み

- **開発環境（WP_ENVIRONMENT_TYPE=local）**: Vite 開発サーバー（`http://localhost:3000`）から HMR でアセットを配信
- **本番環境**: `theme/dist/.vite/manifest.json` を参照してビルド済みアセットを読み込む
- エントリーポイント: `theme/src/assets/js/main.js`, `theme/src/assets/css/index.css`
- `functions.php` の `vite_get_asset_url()` が環境を判定してアセット URL を解決
- WordPress 側は `wp_enqueue_script()` / `wp_enqueue_style()` でアセットをキューに登録
- PHP ファイル変更時は vite-plugin-full-reload でブラウザが自動リロード

### Tailwind CSS v4 の統合

- **CSS インポート方式**: `theme/src/assets/css/index.css` で `@import "tailwindcss"` を使用（従来の設定ファイルなし）
- **スキャン対象**: `@source "../../../**/*.php"` で PHP テンプレートファイルをスキャン
- **カスタムトークン**: `@theme` ブロック内で CSS 変数として定義（例: `--color-main-500`）
- **PostCSS**: `@tailwindcss/postcss` プラグインで処理
- **SCSS は不使用**: Tailwind v4 + CSS ネスティングで十分なため、純粋な CSS のみ

### WordPress テーマ構造

- `theme/functions.php`: Vite アセット読み込みロジック、HMR 対応、ブロック登録
- `theme/index.php`, `theme/front-page.php` 等: テンプレートファイル
- `theme/src/`: ソースファイル（JS, CSS, 画像）
- `theme/dist/`: ビルド出力（Git 管理対象外）
- `theme/blocks/`: カスタムブロック（pnpm ワークスペース、@wordpress/scripts でビルド）

### カスタムブロック開発

- `theme/blocks/{block-name}/` に新規ブロックを作成
- 各ブロックは独立した pnpm ワークスペースパッケージ
- `@wordpress/scripts` でビルド → `build/` に出力
- `theme/functions/blocks.php` が `glob()` で自動検出・登録

### wp-env による環境管理

- `.wp-env.json` で WordPress コア、PHP バージョン（8.4）、テーマパス、ポート番号を管理
- 日本語版 WordPress を使用（`https://ja.wordpress.org/latest-ja.zip`）
- `theme/dist`、`sql`、`scripts` ディレクトリを Docker コンテナにマッピング
- デバッグモード有効（`WP_DEBUG`, `SCRIPT_DEBUG`）

## GitHub操作ルール

- ユーザーからPRを出して、と言われたときは、現在の作業のフィーチャーブランチを切りコミットを行ってからPRを出すようにする
- developやmainへの直接pushは禁止です
- ロジックにまつわる変更をしたあとのPushの前には、プロジェクトルートで `pnpm lint` を行ってからPushするようにしてください
- PR作成時は `gh pr create` コマンドに `--base` オプションを付けず、デフォルトのベースブランチを使用してください
- コミットメッセージは `feat: ...` `fix: ...` などのプレフィックスと簡潔な英語動詞句を使用し、1 コミット 1 目的を徹底します。
- PR には目的、主要変更点、実行コマンド、影響範囲（テンプレート・スタイル・DB）、スクリーンショットやログを含めます。
- 関連課題は `Closes #<issue>` でリンク。レビュアー向けチェックリスト（ビルド済み・バックアップ済み等）を本文末尾に記載してください。
