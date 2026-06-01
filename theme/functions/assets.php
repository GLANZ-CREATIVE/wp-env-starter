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
    if (!wp_script_is("vite-client", "enqueued")) {
      wp_enqueue_script("vite-client", "http://localhost:3000/@vite/client", [], null, true);
      wp_script_add_data("vite-client", "type", "module");
    }
  }

  wp_enqueue_style("theme-style", vite_get_asset_url("assets/css/index.css"), [], null);
  wp_enqueue_script("theme-script", vite_get_asset_url("assets/js/main.js"), [], null, true);
  wp_script_add_data("theme-script", "type", "module");
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
