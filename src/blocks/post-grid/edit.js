import {Component, Fragment} from "@wordpress/element"
import {withSelect} from "@wordpress/data"
import {__} from "@wordpress/i18n"
import {decodeEntities} from "@wordpress/html-entities"
import {RangeControl, PanelBody, Spinner} from "@wordpress/components";
import {InspectorControls} from "@wordpress/editor";

import TPGBQueryControls from '../../components/query-controls'

class PostGridEdit extends Component {

    constructor() {
        super(...arguments);

        this.onChangeNumberOfPosts = this.onChangeNumberOfPosts.bind(this)
    }

    onChangeNumberOfPosts(numberOfPosts) {
        this.props.setAttributes({numberOfPosts})
    }

    extractContent(html, length) {
        const span= document.createElement('span');
        span.innerHTML= html;

        // Remove script tag
        const scripts = span.getElementsByTagName('script');
        let j = scripts.length;
        while (j--) {
            scripts[j].parentNode.removeChild(scripts[j]);
        }

        // Remove style tag
        const styles = span.getElementsByTagName('style');
        let k = styles.length;
        while (k--) {
            styles[k].parentNode.removeChild(styles[k]);
        }

        const children= span.querySelectorAll('*');
        for(let i = 0 ; i < children.length ; i++) {
            if(children[i].textContent)
                children[i].textContent += ' ';
            else
                children[i].innerText += ' ';
        }

        let text = [span.textContent || span.innerText].toString().replace(/\s\s+/g,' ');
        text = text.slice(0, length).trim();

        if (text.length) text += '…' ;

        return text;
    };

    render() {
        const {posts, categories, className, attributes} = this.props
        const {numberOfPosts, postCategory, order, orderBy, columns} = attributes
        console.log(posts)
        return (
            <Fragment>
                <InspectorControls>
                    <PanelBody title={__("General Settings", "tpgb")}>
                        <TPGBQueryControls
                            {...{order, orderBy}}
                            onOrderChange={v => this.props.setAttributes({order: v})}
                            onOrderByChange={v => this.props.setAttributes({orderBy: v})}
                            categoriesList={categories}
                            selectedCategoryId={postCategory}
                            onCategoryChange={v => this.props.setAttributes({postCategory: v})}
                        />
                        <RangeControl
                            label={__("Number of Posts", "tpgb")}
                            value={numberOfPosts}
                            onChange={this.onChangeNumberOfPosts}
                            min={1}
                            max={20}
                        />
                        <RangeControl
                            label={__("Columns", "tpgb")}
                            value={columns}
                            onChange={v => this.props.setAttributes({columns: v})}
                            min={1}
                            max={4}
                        />
                    </PanelBody>
                </InspectorControls>
                {(posts && posts.length > 0) ?
                    <div className={className}>
                        <div className={`tpgb-row columns-${columns}`}>
                            {posts.map(post => (
                                <div className="tpgb-col" key={post.id}>
                                    <div className="tpgb-post-item">
                                        <div className="tpgb-post-item-thumb">
                                            <a href={post.link} target="_blank" rel="noopener">
                                                <img src={ post.featured_media !== 0 ? post.featured_img : 'https://via.placeholder.com/350' } alt={ __( 'Post Image', 'tpgb' ) } />
                                            </a>
                                        </div>
                                        <div className="tpgb-post-item-content">
                                            <h2 className="tpgb-post-item-title">
                                                <a href={post.link} target="_blank" rel="noopener">
                                                    {decodeEntities(post.title.rendered)}
                                                </a>
                                            </h2>
                                            <div
                                                className="tpgb-post-item-desc"
                                                dangerouslySetInnerHTML={
                                                    {
                                                        __html: this.extractContent(post.excerpt.rendered, 150)
                                                    }
                                                }
                                            >
                                            </div>
                                            <div className="tpgb-post-item-readmore">
                                                <a href={ post.link } target="_blank">{ __( 'Read More', 'tpgb' ) }</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    :
                    <div>{posts ? __('No posts found', 'tpgb') : <Spinner/>}</div>
                }
            </Fragment>
        )
    }
}

export default withSelect(
    (select, props) => {
        const {getEntityRecords} = select('core');
        const {attributes} = props
        const {numberOfPosts, postCategory, order, orderBy} = attributes
        let query = {
            order: order,
            orderby: orderBy,
            per_page: numberOfPosts
        }
        if (postCategory) {
            query['categories'] = postCategory
        }
        return {
            posts: getEntityRecords('postType', 'post', query),
            categories: getEntityRecords('taxonomy', 'category', {per_page: -1})
        }
    }
)(PostGridEdit);