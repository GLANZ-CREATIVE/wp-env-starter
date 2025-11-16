/**
 * 画像を自動的に import して manifest.json に含める
 *
 * import.meta.glob は Vite の機能で、指定したパターンに一致する
 * すべてのファイルを自動的に import します。
 *
 * { eager: true } を指定することで、ビルド時にすべての画像が
 * manifest.json に含まれ、最適化されます。
 *
 * 新しい画像を追加しても、このファイルを編集する必要はありません。
 * 自動的に検出されて最適化されます。
 */

// すべての画像を自動的に import
const images = import.meta.glob("../images/**/*.{png,jpg,jpeg,gif,svg,webp,avif}", {
  eager: true,
});

// デバッグ用（開発環境でコンソールに出力）
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log("Loaded images:", Object.keys(images));
}

export default images;
