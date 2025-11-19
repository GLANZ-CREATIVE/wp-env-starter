<?php
/**
 * アセット読み込み関連の関数
 *
 * @package Theme
 */

/**
 * スタイルとスクリプトを読み込む
 */
function theme_enqueue_assets()
{
  if (wp_get_environment_type() == "local") {
    // 開発環境では、Vite開発サーバーからHMRスクリプトとして読み込む
    if (!wp_script_is("vite-client", "enqueued")) {
      wp_enqueue_script("vite-client", "http://localhost:3000/@vite/client", [], null, true);
    }
  }

  wp_enqueue_style("theme-style", vite_get_asset_url("assets/scss/style.scss"), [], null);
  wp_enqueue_script("theme-script", vite_get_asset_url("assets/js/main.js"), [], null, true);
}
add_action("wp_enqueue_scripts", "theme_enqueue_assets");

/**
 * type="module"属性を付与するフィルター
 *
 * @param string $tag スクリプトタグ
 * @param string $handle スクリプトハンドル
 * @param string $src スクリプトのURL
 * @return string フィルター後のスクリプトタグ
 */
function add_module_type_attribute($tag, $handle, $src)
{
  // Vite関連のスクリプトにtype="module"を追加
  if (in_array($handle, ["vite-client", "theme-script"])) {
    $tag = str_replace("<script ", '<script type="module" ', $tag);
  }
  return $tag;
}
add_filter("script_loader_tag", "add_module_type_attribute", 10, 3);
