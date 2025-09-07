<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
  <meta charset="<?php bloginfo("charset"); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>

<?php
$body_id = "page";
if (is_front_page() || is_home()) {
  $body_id = "front-page";
} elseif (is_singular()) {
  $post_obj = get_post();
  if ($post_obj) {
    $slug = $post_obj->post_name;
    $type = $post_obj->post_type;
    $body_id = $type . "-" . $slug;
  }
} elseif (is_post_type_archive()) {
  $pt = get_query_var("post_type");
  if (is_array($pt)) {
    $pt = reset($pt);
  }
  $body_id = "archive-" . ($pt ? $pt : "post");
} elseif (is_category() || is_tag() || is_tax()) {
  $term = get_queried_object();
  if ($term && !is_wp_error($term)) {
    if (isset($term->taxonomy) && isset($term->slug)) {
      $body_id = "term-" . $term->taxonomy . "-" . $term->slug;
    }
  }
} elseif (is_search()) {
  $body_id = "search";
} elseif (is_404()) {
  $body_id = "not-found";
}
?>

<body data-type="<?php echo wp_get_environment_type(); ?>" id="<?php echo esc_attr($body_id); ?>" <?php body_class(); ?>>
  <?php wp_body_open(); ?>

  <header class="flex justify-between">
    <div>
      <?php if (is_front_page() && is_home()): ?>
        <h1><a href="<?php echo esc_url(home_url("/")); ?>"><?php bloginfo("name"); ?></a></h1>
      <?php else: ?>
        <p><a href="<?php echo esc_url(home_url("/")); ?>"><?php bloginfo("name"); ?></a></p>
      <?php endif; ?>
    </div>

    <nav class="[&_ul]:flex" aria-label="メニュー">
      <?php wp_nav_menu([
        "theme_location" => "primary",
        "menu_id" => "primary-menu",
      ]); ?>
    </nav>
  </header>