import './style.editor.scss'
import edit from './edit'

const {registerBlockType} = wp.blocks
const {__} = wp.i18n

registerBlockType('tpgb/post-grid', {
    title: __('Post Grid', 'tpgb'),
    description: __('Display grid posts', 'tpgb'),
    category: 'tpgb-blocks',
    keywords: [__('post', 'tpgb'), __('grid', 'tpgb')],
    edit: edit,
    save: function ({className}) {
        return <p className={className}>Post Grid Front end</p>;
    }
})