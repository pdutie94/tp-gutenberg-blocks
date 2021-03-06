import './blocks/post-grid/script'
import './blocks/product-grid/script'

const $ = jQuery
// Import slick script files
import "slick-carousel/slick/slick.min"
import "slick-carousel/slick/slick.scss"
import "slick-carousel/slick/slick-theme.scss"

$(document).ready(() => {
    $('.tpgb-woo-products.slider-view .products:not(.slick-initialized)').slick({
        dots: true,
        adaptiveHeight: true,
        slidesToShow: 4,
    })
})