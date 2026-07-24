<?php

/**
 * Front page template
 *
 * @package WPStarter
 */

wp_enqueue_style('front-page', assets_url('css/pages/front-page.css'), [], '1.0.0');

get_header(); ?>

<div>
    <h1 class="title">WordPress Starter theme with Vite</h1>
    <img class="image" src="<?php echo esc_url(assets_url('images/600x600.png')); ?>" alt="" width="600" height="600" loading="eager">
</div>

<?php get_footer(); ?>