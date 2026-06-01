<?php
/**
 * Vite関連の関数
 *
 * @package Theme
 */

/**
 * manifest.json の内容をリクエスト内でキャッシュして返す
 *
 * @return array|null パース済みマニフェスト。ファイルが存在しない場合は null
 */
function vite_get_manifest()
{
  static $manifest_content = null;
  static $loaded = false;

  if ($loaded) {
    return $manifest_content;
  }

  $loaded = true;
  $manifest = get_theme_file_path("/dist/.vite/manifest.json");

  if (file_exists($manifest)) {
    $manifest_content = json_decode(file_get_contents($manifest), true) ?? null;
  }

  return $manifest_content;
}

/**
 * ViteアセットのURLを取得
 *
 * @param string $asset アセットのパス（例: 'assets/css/index.css'）
 * @return string アセットのURL
 */
function vite_get_asset_url($asset)
{
  if (wp_get_environment_type() == "local") {
    return "http://localhost:3000/" . $asset;
  }

  $manifest_content = vite_get_manifest();

  if ($manifest_content !== null) {
    if (isset($manifest_content[$asset])) {
      return get_theme_file_uri("/dist/" . $manifest_content[$asset]["file"]);
    }

    if (isset($manifest_content["assets/js/main.js"]["css"][0])) {
      return get_theme_file_uri("/dist/" . $manifest_content["assets/js/main.js"]["css"][0]);
    }

    foreach ($manifest_content as $entry) {
      if (isset($entry["css"][0])) {
        return get_theme_file_uri("/dist/" . $entry["css"][0]);
      }
    }
  }

  return get_theme_file_uri("/dist/" . $asset);
}

/**
 * 画像アセットのURLを取得
 *
 * @param string $image_path 画像の相対パス（例: 'assets/images/hero.jpg'）
 * @return string 画像のURL
 */
function vite_get_image_url($image_path)
{
  if (wp_get_environment_type() == "local") {
    return "http://localhost:3000/" . $image_path;
  }

  $manifest_content = vite_get_manifest();

  if ($manifest_content !== null) {
    foreach ($manifest_content as $key => $entry) {
      if (isset($entry["file"]) && strpos($key, $image_path) !== false) {
        return get_theme_file_uri("/dist/" . $entry["file"]);
      }
    }
  }

  return get_theme_file_uri("/dist/" . $image_path);
}

/**
 * テンプレートディレクトリURIの短縮関数（src/assets/まで）
 *
 * 画像ファイルの場合は自動的に Vite の最適化パイプラインを通します。
 * - 開発環境: Vite dev server (http://localhost:3000) から配信
 * - 本番環境: ビルド時に最適化された画像を manifest.json から読み込み
 *
 * 画像以外のアセット（CSS、JS など）は従来通り src/assets/ から直接配信されます。
 *
 * @param string $path アセットの相対パス（例: 'images/top/img-mv.png'）
 *                     空文字列の場合はベースURL（/src/assets）を返す
 * @return string アセットのURL
 *
 * @example
 * // 画像ファイル（自動的に最適化パイプラインを通す）
 * assets_url('images/top/img-mv.png')
 * // => 開発環境: 'http://localhost:3000/assets/images/top/img-mv.png'
 * // => 本番環境: '/wp-content/themes/theme/dist/assets/img-mv-abc123.png' (最適化済み)
 *
 * // 画像以外のアセット（従来通り）
 * assets_url('css/custom.css')
 * // => '/wp-content/themes/theme/src/assets/css/custom.css'
 */
function assets_url($path = "")
{
  // パスが空の場合はベースURLのみ返す
  if (empty($path)) {
    return get_template_directory_uri() . "/src/assets";
  }

  $normalized_path = ltrim($path, "/");

  // 画像ファイルかどうかを判定（拡張子でチェック）
  // 対応形式: jpg, jpeg, png, gif, webp, svg, avif, tiff
  $image_extensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "tiff"];
  $path_lower = strtolower($normalized_path);
  $is_image = false;

  foreach ($image_extensions as $ext) {
    if (str_ends_with($path_lower, "." . $ext)) {
      $is_image = true;
      break;
    }
  }

  // 画像ファイルの場合は vite_get_image_url() を使用して最適化パイプラインを通す
  if ($is_image) {
    // assets_url() のパス形式（例: 'images/top/img-mv.png'）を
    // vite_get_image_url() のパス形式（例: 'assets/images/top/img-mv.png'）に変換
    $vite_path = "assets/" . $normalized_path;
    return vite_get_image_url($vite_path);
  }

  // 画像以外のアセットは従来通り src/assets/ から直接配信
  return get_template_directory_uri() . "/src/assets/" . $normalized_path;
}
