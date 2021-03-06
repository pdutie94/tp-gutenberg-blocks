import edit from './edit'
import './style.editor.scss'

const {registerBlockType} = wp.blocks
const {__} = wp.i18n

const blockAttr = {
    category: {
        type: 'string',
    },
    categories: {
        type: 'array',
        default: [],
    },
    order: {
        type: 'string',
        default: 'desc',
    },
    orderBy: {
        type: 'string',
        default: 'date',
    },
    numberOfProducts: {
        type: 'number',
        default: 6,
    },
    columns: {
        type: 'number',
        default: 3,
    },
    viewType: {
        type: 'string',
        default: 'grid'
    }
}

registerBlockType('tpgb/product-grid', {
    title: __('Product Grid', 'tpgb'),
    description: __('Display grid products', 'tpgb'),
    category: 'tpgb-blocks',
    keywords: [__('product', 'tpgb'), __('grid', 'tpgb')],
    attributes: blockAttr,
    edit: edit,
    save: function ({attributes}) {
        const {
            category,
            categories,
            order,
            orderBy,
            numberOfProducts,
            columns,
            viewType,
        } = attributes;

        const listCats = categories.join(',');
        const shortCode = [
            '[products',
            `limit="${numberOfProducts}"`,
            `columns="${columns}"`,
            `orderby="${orderBy}"`,
            `order="${order}"`,
            category === 'manually' && `category="${listCats}"`,
            ']',
        ].filter( Boolean ).join( ' ' );

        const blockClassName = [
            'tpgb-woo-products',
            'tpgb-woo-product-grid',
            viewType === 'slider' && 'slider-view',
        ].filter( Boolean ).join( ' ' );

        return (
            <div className={ blockClassName }>
                {shortCode}
            </div>
        );
    }
})