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
  if ("local" === wp_get_environment_type()) {
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
