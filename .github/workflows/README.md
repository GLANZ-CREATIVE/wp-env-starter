# GitHub Actions ワークフロー

このディレクトリには GitHub Actions のワークフローファイルが含まれています。

## ワークフロー一覧

### `workflows/deploy.yml` - FTP デプロイ

WordPress テーマを FTP サーバーに自動デプロイするワークフローです。

#### 概要

- **実行環境**: Ubuntu Latest
- **タイムアウト**: 15分
- **デプロイ先**: FTP サーバー
- **デプロイ対象**: `theme/` ディレクトリ

#### トリガー条件

以下の条件でワークフローが実行されます：

- `main` ブランチへの push → 本番環境（production）へデプロイ
- `develop` ブランチへの push → ステージング環境（staging）へデプロイ
- GitHub Actions の UI から手動実行（`workflow_dispatch`）

#### デプロイの流れ

1. **コードのチェックアウト**
   - リポジトリのコードを取得

2. **Node.js 環境のセットアップ**
   - Node.js v22.18.0 をセットアップ
   - npm を v11.4.1 にアップグレード
   - npm キャッシュを有効化

3. **依存関係のインストール**
   - `npm ci --prefer-offline --no-audit` で依存関係をインストール

4. **ビルド**
   - `npm run build` を実行して本番用ビルドを生成
   - `NODE_ENV=production` で実行

5. **デプロイ変数の設定**
   - ブランチに応じて環境変数を設定
   - `main` → production 環境のシークレットを使用
   - `develop` → staging 環境のシークレットを使用

6. **FTP デプロイ**
   - `SamKirkland/FTP-Deploy-Action@4.3.0` を使用して FTP サーバーにデプロイ
   - `theme/` ディレクトリの内容をアップロード

#### 必要なシークレットと変数

GitHub リポジトリの Settings > Secrets and variables > Actions で以下のシークレットと変数を設定する必要があります。

##### 本番環境（Production）

**Secrets:**

- `FTP_HOST_PROD` - FTP サーバーのホスト名
- `FTP_USER_PROD` - FTP ユーザー名
- `FTP_PASSWORD_PROD` - FTP パスワード

**Variables:**

- `FTP_SERVER_DIR_PROD` - サーバー上のデプロイ先ディレクトリパス

##### ステージング環境（Staging）

**Secrets:**

- `FTP_HOST_STG` - FTP サーバーのホスト名
- `FTP_USER_STG` - FTP ユーザー名
- `FTP_PASSWORD_STG` - FTP パスワード

**Variables:**

- `FTP_SERVER_DIR_STG` - サーバー上のデプロイ先ディレクトリパス

#### デプロイ除外ファイル

以下のファイル・ディレクトリはデプロイから除外されます：

- `node_modules/` - 依存関係（サーバー側で不要）
- `.git/` - Git リポジトリ情報
- `.github/` - GitHub Actions 設定
- `*.md` - Markdown ファイル（README など）
- `.gitignore` - Git 設定ファイル
- `.cursorrules` - Cursor 設定ファイル
- `package*.json` - npm 設定ファイル
- `vite.config.js` - Vite 設定ファイル
- `postcss.config.js` - PostCSS 設定ファイル
- `eslint.config.mjs` - ESLint 設定ファイル
- `lefthook.yml` - Lefthook 設定ファイル
- `setup.js` - セットアップスクリプト
- `sql/` - SQL ファイル（ローカル開発用）
- `uploads/` - アップロードファイル（ローカル開発用）

#### 注意事項

- **現在の状態**: ワークフローはコメントアウトされており、実行されません
- **有効化方法**: `deploy.yml` のコメント（`#`）を削除してワークフローを有効化してください
- **デプロイ前の確認**: デプロイ前に必ず `npm run build` が正常に完了することを確認してください
- **ビルド成果物**: `theme/dist/` ディレクトリにビルド済みアセットが生成されます

#### トラブルシューティング

##### デプロイが失敗する場合

1. **シークレット・変数の確認**
   - 必要なシークレットと変数が正しく設定されているか確認
   - 環境（production/staging）に応じた値が設定されているか確認

2. **FTP 接続の確認**
   - FTP サーバーのホスト名、ユーザー名、パスワードが正しいか確認
   - サーバー上のディレクトリパスが存在し、書き込み権限があるか確認

3. **ビルドエラーの確認**
   - GitHub Actions のログでビルドステップのエラーを確認
   - ローカルで `npm run build` を実行してエラーがないか確認

4. **タイムアウトの対処**
   - デプロイに時間がかかる場合は `timeout-minutes` を増やす

##### デプロイが実行されない場合

- ワークフローがコメントアウトされていないか確認
- ブランチ名が `main` または `develop` であることを確認
- GitHub Actions がリポジトリで有効になっているか確認
