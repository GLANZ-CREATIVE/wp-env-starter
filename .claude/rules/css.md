---
paths:
  - "theme/**/*.css"
---

# CSS ルール


## デザイントークン優先

直値（hex, px など）を書く前に、[tokens.css](theme/src/assets/css/base/tokens.css) の `:root` に対応するトークンがあるか確認する。無ければ直値ではなくトークンを新規追加して参照する。コンポーネント/ページ内だけで使う派生値はローカルカスタムプロパティ（`.hero { --hero-copy-col: 600px; }`）で宣言する。

## バリアントは `data-*` 属性

コンポーネントの見た目バリアントは `data-*` 属性セレクタで表現する（例: `.c-button[data-button-variant="primary"]`）。`--modifier`（BEM）を新規で増やさない。値の列挙を HTML 側に明示でき、JS からも `dataset` で読み書きできる。

## 新規 CSS ファイルは `@import` 登録が必要

[index.css](theme/src/assets/css/index.css) は自動集約しない。新しいファイルを作ったら `@import` 行を追加する。レイヤー順（reset → base → theme → components → utilities）に影響する位置に入れる。

## `reset.css` は編集しない

[reset.css](theme/src/assets/css/base/reset.css) は stylelint 対象外で、挙動を変えたい時は直接編集せず `@layer base` 以降で上書きする。

## 既存の `@layer` 運用に合わせる

既存ファイルに `@layer` 外で書かれているスタイルがある場合はそのパターンを踏襲する。既存宣言を勝手に `@layer` で包み直さない。新規ファイルで `@layer` を使うかは、同じ種別の既存ファイルに合わせる。

## 疑似要素アイコンは `mask-image` + トークン

矢印やシェブロンなど疑似要素で出すアイコンは、SVG を `data:image/svg+xml,...` の `url()` 形式で `:root` の `--icon-*` トークンに登録し、`::before` / `::after` で `mask-image: var(--icon-*)` として呼び出す。配色は `background: linear-gradient(currentcolor 0 0), CanvasText;` で行い、強制カラーモードでも可視化されるようにする。SVG 内の `stroke` / `fill` は `black` で固定（実色は CSS 側で制御）。
