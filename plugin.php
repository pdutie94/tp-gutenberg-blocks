<?php
/**
 * Plugin Name: TP Gutenberg Blocks
 * Plugin URI: https://tienpham.xyz/
 * Description: Advanced blocks for Wordpress Gutenberg
 * Version: 1.0.0
 * Author: Tien Pham
 * Author URI: http://tienpham.xyz/
 **/

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'wp_enqueue_scripts', 'tpgb_enqueue_scripts' );
function tpgb_enqueue_scripts() {
	wp_enqueue_script( 'tpgb-blocks-script', plugins_url( 'dist/script.js', __FILE__ ), array( 'jquery' ) );
}

function tpgb_blocks_register_block_type( $block, $options = array() ) {
	register_block_type(
		'tpgb/' . $block,
		array_merge(
			array(
				'editor_script' => 'tpgb-blocks-editor-script',
				'editor_style'  => 'tpgb-blocks-editor-style',
//				'script'        => 'tpgb-blocks-script',
				'style'         => 'tpgb-blocks-style'
			),
			$options
		)
	);
}

function tpgb_blocks_register() {

	wp_register_script(
		'tpgb-blocks-editor-script',
		plugins_url( 'dist/editor.js', __FILE__ ),
		array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-data', 'wp-html-entities', 'wp-editor', 'wp-url' )
	);
	/*wp_register_script(
		'tpgb-blocks-script',
		plugins_url( 'dist/script.js', __FILE__ ),
		array( 'jQuery' )
	);*/
	wp_register_style(
		'tpgb-blocks-editor-style',
		plugins_url( 'dist/editor.css', __FILE__ ),
		array( 'wp-edit-blocks' )
	);
	wp_register_style(
		'tpgb-blocks-style',
		plugins_url( 'dist/style.css', __FILE__ )
	);

	tpgb_blocks_register_block_type( 'post-grid', array(
		'render_callback' => 'tpgb_blocks_render_post_grid_block',
		'attributes'      => array(
			'numberOfPosts' => array(
				'type'    => 'number',
				'default' => 10
			),
			'postCategory'  => array(
				'type' => 'number'
			),
			'order'         => array(
				'type'    => 'string',
				'default' => 'desc'
			),
			'orderBy'       => array(
				'type'    => 'string',
				'default' => 'date'
			),
			'columns'       => array(
				'type'    => 'number',
				'default' => 4
			)
		)
	) );
	tpgb_blocks_register_block_type( 'product-grid' );
	tpgb_blocks_register_block_type( 'product-carousel' );

}

add_action( 'init', 'tpgb_blocks_register' );

function tpgb_blocks_category( $categories ) {
	return array_merge(
		$categories,
		array(
			array(
				'slug'  => 'tpgb-blocks',
				'title' => __( 'TP Gutenberg Blocks', 'tpgb' ),
			),
		)
	);
}

add_filter( 'block_categories', 'tpgb_blocks_category', 10, 2 );

function tpgb_blocks_render_post_grid_block( $attributes ) {
	$args = array(
		'posts_per_page'      => $attributes['numberOfPosts'],
		'order'               => $attributes['order'],
		'orderby'             => $attributes['orderBy'],
		'ignore_sticky_posts' => true
	);

	if ( $attributes['postCategory'] ) {
		$args['cat'] = $attributes['postCategory'];
	}

	$query = new WP_Query( $args );
	$posts = '';
	if ( $query->have_posts() ) {
		$posts .= '<div class="wp-block-tpgb-post-grid">';
		$posts .= '<div class="tpgb-row columns-' . $attributes['columns'] . '">';
		while ( $query->have_posts() ) {
			$query->the_post();
			$posts .= '<div class="tpgb-col">';
			$posts .= '<div class="tpgb-post-item">';
			$posts .= '<div class="tpgb-post-item-thumb">';
			$posts .= '<a href="' . esc_url( get_the_permalink() ) . '">';
			if ( get_the_post_thumbnail( get_the_ID(), 'large' ) !== '' ) {
				$posts .= get_the_post_thumbnail( get_the_ID(), 'large' );
			} else {
				$posts .= '<img src="https://via.placeholder.com/350" class=" wp-post-image" alt="Post Image">';
			}
			$posts .= '</a>';
			$posts .= '</div>';
			$posts .= '<div class="tpgb-post-item-content">';
			$posts .= '<h2 class="tpgb-post-item-title">';
			$posts .= '<a href="' . esc_url( get_the_permalink() ) . '">' . get_the_title() . '</a>';
			$posts .= '</h2>';
			$posts .= '<div class="tpgb-post-item-desc">' . tpgb_extract_html( get_the_excerpt(), 150 ) . '</div>';
			$posts .= '<div class="tpgb-post-item-readmore"><a href=' . esc_url( get_the_permalink() ) . ' target="_blank">' . __( 'Read More', 'tpgb' ) . '</a></div>';
			$posts .= '</div>';
			$posts .= '</div>';
			$posts .= '</div>';
		}
		$posts .= '</div>';
		$posts .= '</div>';
		wp_reset_postdata();
	} else {
		return '<div>' . __( 'No posts found', 'tpgb' ) . '</div>';
	}

	return $posts;
}

function tpgb_extract_html( $html, $length ) {
	if ( ! trim( $html ) ) {
		return '';
	}

	$html = <<<HTML
$html
HTML;

	$dom = new DOMDocument();

	libxml_use_internal_errors( true );
	$dom->loadHTML( mb_convert_encoding( $html, 'HTML-ENTITIES', 'UTF-8' ) );

	$scripts = $dom->getElementsByTagName( 'script' );
	$styles  = $dom->getElementsByTagName( 'style' );
	$remove  = array();

	foreach ( $scripts as $item ) {
		$remove[] = $item;
	}

	foreach ( $styles as $item ) {
		$remove[] = $item;
	}

	foreach ( $remove as $item ) {
		$item->parentNode->removeChild( $item );
	}

	$html = $dom->saveHTML();
	$text = strip_tags( $html );
	$text = trim( preg_replace( '/\s\s+/', ' ', $text ) );

	if ( ! $text ) {
		return '';
	}

	$textLen = strlen( $text );
	$text    = substr( $text, 0, $length );
	if ( $textLen > $length ) {
		$text .= '...';
	}

	return $text;
}