<?php

/**
 * Front page template
 *
 * @package WPStarter
 */

vite_enqueue_page_style('front-page', 'assets/css/pages/front-page.css');

get_header(); ?>

<div>
    <h1 class="title">WordPress Starter theme with Vite</h1>
    <img class="image" src="<?php echo esc_url(assets_url('images/600x600.png')); ?>" alt="" width="600" height="600" loading="eager">
</div>

<?php get_footer(); ?>