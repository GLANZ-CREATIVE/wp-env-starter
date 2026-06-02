# Repository Guidelines

## 開発環境

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
