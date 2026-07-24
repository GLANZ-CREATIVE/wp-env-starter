# カスタムブロック

`@wordpress/create-block` と `@wordpress/scripts`（公式ツールチェーン）でブロックを管理する。

## ディレクトリ構成

```
theme/blocks/
├── package.json      ← 削除禁止（下記「隔離用 package.json」参照）
├── {block-name}/     ← ソース（create-block が生成するフラット構成）
└── build/            ← ビルド成果物（.gitignore 済み、PHP が走査して自動登録）
```

## コマンド

| コマンド | 内容 |
|---------|------|
| `pnpm blocks:new <name>` | `theme/blocks/<name>/` に公式テンプレートを生成 |
| `pnpm build:blocks` | `theme/blocks/build/` に一括ビルド |
| `pnpm start:blocks` | 開発用 watch ビルド |

ビルドされたブロックは `theme/functions/blocks.php` が `build/*/block.json` を走査して自動登録する。

## 隔離用 package.json

`theme/blocks/package.json` は **`type` フィールドをあえて持たない** ことが役割。

ルートの `package.json` は Vite のため `"type": "module"` を持つが、これが webpack に漏れると
`@wordpress/scripts`（CommonJS 前提）のビルドが `import/export` 構文エラーや
"fully specified" 解決エラーで壊れる。このディレクトリに `type` 未指定の `package.json` を
1 枚置くことで、webpack がルートの ESM 設定を参照しないよう遮断している。

**このファイルを削除したり `"type"` を追加すると `pnpm build:blocks` が壊れる。**
