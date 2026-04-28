<?php
/**
 * アセット読み込み関連の関数
 *
 * @package Theme
 */

/**
 * フロントエンドのスタイルとスクリプトを読み込む
 */
function theme_enqueue_assets()
{
  if (wp_get_environment_type() == "local") {
    // 開発環境では Vite dev server から HMR クライアントを読み込む
    if (!wp_script_is("vite-client", "enqueued")) {
      wp_enqueue_script("vite-client", "http://localhost:3000/@vite/client", [], null, true);
    }
  }

  wp_enqueue_style("theme-style", vite_get_asset_url("assets/css/index.css"), [], null);
  wp_enqueue_script("theme-script", vite_get_asset_url("assets/js/main.js"), [], null, true);
}
add_action("wp_enqueue_scripts", "theme_enqueue_assets");

/**
 * ブロックエディタ iframe 用のスタイル（tokens + 本文タイポ）を読み込む
 *
 * フロント本体ではなく editor.css のみを当てることで、
 * エディタの UI に影響を与えずに本文プレビューだけを整える。
 */
function theme_enqueue_block_editor_assets_iframe()
{
  if (!is_admin()) {
    return;
  }

  wp_enqueue_style("theme-editor-iframe", vite_get_asset_url("assets/css/editor.css"), [], null);
}
add_action("enqueue_block_assets", "theme_enqueue_block_editor_assets_iframe");

/**
 * type="module" 属性を Vite 関連スクリプトに付与する
 *
 * @param string $tag    スクリプトタグ
 * @param string $handle スクリプトハンドル
 * @param string $src    スクリプトの URL
 * @return string フィルター後のスクリプトタグ
 */
function add_module_type_attribute($tag, $handle, $src)
{
  if (in_array($handle, ["vite-client", "theme-script"])) {
    $tag = str_replace("<script ", '<script type="module" ', $tag);
  }
  return $tag;
}
add_filter("script_loader_tag", "add_module_type_attribute", 10, 3);
