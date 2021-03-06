import {Component, Fragment} from "@wordpress/element"
import {__} from "@wordpress/i18n"
import {RangeControl, PanelBody, SelectControl, CheckboxControl, ToolbarGroup} from "@wordpress/components"
import {InspectorControls, BlockControls} from "@wordpress/editor"
import {addQueryArgs} from "@wordpress/url"

// Import css files
import "slick-carousel/slick/slick.min"
import "slick-carousel/slick/slick.scss"
import "slick-carousel/slick/slick-theme.scss"

let fetchingQueue = null;

class ProductGridEdit extends Component {

    constructor() {
        super(...arguments);

        this.state = {
            categoriesList: [],
            productsList: [],
            error: false,
        }

        //this.setCategories = this.setCategories.bind(this)
        this.fetchProducts = this.fetchProducts.bind(this)
    }

    componentWillMount() {
        this.fetchProducts()
    }

    componentWillUpdate(nextProps) {
        const {clientId} = this.props;
        const $ = jQuery;

        if (this.checkAttrChanged(nextProps.attributes, this.props.attributes)) {
            $(`#block-${clientId} .tpgb-row.slick-initialized`).slick('unslick');
        }
    }

    componentDidUpdate(prevProps) {
        const {categoriesList} = this.state
        const {attributes} = this.props
        const {category} = attributes

        if (category === 'manually' && categoriesList.length === 0) {
            wp.apiFetch({path: addQueryArgs('/wc/v3/products/categories', {per_page: -1})}).then(
                obj => this.setState({categoriesList: obj})
            ).catch(error => {
                console.log(error)
            })
        }

        if (this.checkAttrChanged(prevProps.attributes, attributes)) {
            this.fetchProducts();
        }
    }

    setCategories(catID, willAdd) {
        const {attributes, setAttributes} = this.props;
        const {categories} = attributes;

        if (willAdd) {
            setAttributes({categories: [...categories, catID]});
        } else {
            setAttributes({categories: categories.filter((cat) => cat !== catID)})
        }

        this.fetchProducts()
    }

    fetchProducts() {
        const self = this;
        const {
            viewType,
            category,
            categories,
            order,
            orderBy,
            numberOfProducts,
        } = this.props.attributes;

        const query = addQueryArgs(
            '/wc/v3/products',
            {
                order: order || undefined,
                orderby: orderBy || undefined,
                per_page: numberOfProducts,
                category: category === 'manually' ? categories.join(',') : undefined,
            }
        );

        if (fetchingQueue) {
            clearTimeout(fetchingQueue)
        }

        if (this.state.error) {
            this.setState({error: false});
        }

        fetchingQueue = setTimeout(() => {
            wp.apiFetch({path: query}).then((obj) => {
                self.setState({
                    productsList: obj,
                })
            }).catch(() => {
                self.setState({
                    error: true,
                })
            }).then(() => {
                if (viewType === 'slider') {
                    jQuery(`#block-${self.props.clientId} .tpgb-products-grid-block.slider-view .tpgb-row:not(.slick-initialized)`).slick({
                        dots: true,
                        adaptiveHeight: true,
                        slidesToShow: 4
                    });
                }
            })
        }, 500)
    }

    checkAttrChanged(prevAttrs, curAttrs) {
        const {
            viewType: prevView,
            category: prevCat,
            categories: prevCats,
            order: prevOrder,
            orderBy: prevOrderBy,
            numberOfProducts: prevLength
        } = prevAttrs;
        const {viewType, category, categories, order, orderBy, numberOfProducts} = curAttrs;

        return (
            category !== prevCat
            || categories !== prevCats
            || order !== prevOrder
            || orderBy !== prevOrderBy
            || numberOfProducts !== prevLength
            || prevView !== viewType
        )
    }

    render() {
        const {categoriesList, productsList, error} = this.state;
        const {attributes, setAttributes} = this.props;
        const {
            category,
            categories,
            order,
            orderBy,
            numberOfProducts,
            columns,
            viewType
        } = attributes;

        const viewControls = [
            {
                icon: 'grid-view',
                title: __('Normal View', 'tpgb'),
                onClick: () => setAttributes({viewType: 'grid'}),
                isActive: viewType === 'grid',
            },
            {
                icon: 'slides',
                title: __('Slider View', 'tpgb'),
                onClick: () => setAttributes({viewType: 'slider'}),
                isActive: viewType === 'slider',
            },
        ];

        const blockClassName = [
            "tpgb-products-grid-block",
            viewType === 'slider' && 'slider-view',
        ].filter(Boolean).join(' ');

        const blockWrapperClassName = [
            "tpgb-row",
            `columns-${columns}`,
        ].filter(Boolean).join(' ');

        const productsListFiltered = productsList.filter(product => {
            return product.catalog_visibility !== 'hidden';

        })

        return (
            <Fragment>
                <BlockControls>
                    <ToolbarGroup controls={viewControls}/>
                </BlockControls>
                <InspectorControls>
                    <PanelBody title={__("General Settings", "tpgb")}>
                        <SelectControl
                            label={__('Category', 'tpgb')}
                            value={category}
                            options={[
                                {label: __('All', 'tpgb'), value: ''},
                                {label: __('Manually Select', 'tpgb'), value: 'manually'},
                            ]}
                            onChange={v => setAttributes({category: v})}
                        />
                        {category === 'manually' &&
                        <div className="tpgb-woo-categories-list components-base-control">
                            {categoriesList.map((cat, index) => (
                                <CheckboxControl
                                    key={index}
                                    label={[
                                        cat.name,
                                        <span key="cat-count" style={{fontSize: 'small', color: '#999', marginLeft: 5}}>
                                                    ({cat.count})
                                                </span>
                                    ]}
                                    checked={jQuery.inArray(cat.id, categories) > -1}
                                    onChange={v => this.setCategories(cat.id, v)}
                                />
                            ))}
                        </div>
                        }
                        <SelectControl
                            label={__('Order', 'tpgb')}
                            value={`${orderBy}-${order}`}
                            options={[
                                {label: __('Newest to oldest', 'tpgb'), value: 'date-desc'},
                                {label: __('Price: high to low', 'tpgb'), value: 'price-desc'},
                                {label: __('Price: low to high', 'tpgb'), value: 'price-asc'},
                                {label: __('Highest Rating first', 'tpgb'), value: 'rating-desc'},
                                {label: __('Most sale first', 'tpgb'), value: 'popularity-desc'},
                                {label: __('Title: Alphabetical', 'tpgb'), value: 'title-asc'},
                                {label: __('Title: Alphabetical reversed', 'tpgb'), value: 'title-desc'},
                            ]}
                            onChange={(value) => {
                                const splitedVal = value.split('-');
                                return setAttributes({
                                    orderBy: splitedVal[0],
                                    order: splitedVal[1],
                                })
                            }}
                        />
                        {viewType !== 'slider' && <RangeControl
                            label={__("Columns", "tpgb")}
                            value={columns}
                            onChange={v => setAttributes({columns: v})}
                            min={1}
                            max={4}
                        />
                        }
                        <RangeControl
                            label={__("Number of Products", "tpgb")}
                            value={numberOfProducts}
                            onChange={v => setAttributes({numberOfProducts: v})}
                            min={1}
                            max={20}
                        />
                    </PanelBody>
                </InspectorControls>
                <div className={blockClassName}>
                    {!error && productsList.length > 0 &&
                    <div className={blockWrapperClassName}>
                        {productsListFiltered.map((product, idx) => (
                            <div className="tpgb-col" key={idx}>
                                <div className="tpgb-product">
                                    <div className="tpgb-product-img">
                                        <img src={product.images.length ? product.images[0].src : undefined}
                                             alt={product.name}/>
                                    </div>
                                    <div className="tpgb-product-title">{product.name}</div>
                                    <div className="tpgb-product-price"
                                         dangerouslySetInnerHTML={{__html: product.price_html}}/>
                                    <div className="tpgb-product-add-to-cart">
                                        <span>{__('Add to cart', 'tpgb')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    }
                </div>
            </Fragment>
        )
    }
}

export default ProductGridEdit