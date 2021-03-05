const autoprefixer = require('autoprefixer');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const path = require('path');

module.exports =  (env, argv) => {
    function isDevelopment() {
        return argv.mode === 'development';
    }
    var config = {
        entry: {
            editor: './src/editor.js',
            script: './src/script.js'
        },
        output: {
            path: path.resolve(process.cwd(), 'dist'),
            filename: '[name].js'
        },
        optimization: {
            minimizer: [
                new TerserPlugin({}),
                new OptimizeCSSAssetsPlugin(
                    {
                        cssProcessorOptions: {
                            map: {
                                inline: false,
                                annotation: true
                            }
                        }
                    })
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new MiniCSSExtractPlugin({
                chunkFilename: "[id].css",
                filename: chunkData => {
                    return chunkData.chunk.name === 'script' ? 'style.css' : '[name].css'
                }
            })
        ],
        devtool: isDevelopment() ? 'cheap-module-source-map' : 'source-map',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                [
                                    '@babel/preset-react',
                                    {
                                        "development": isDevelopment()
                                    }
                                ]
                            ]
                        }
                    }
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCSSExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        autoprefixer()
                                    ]
                                }
                            }
                        },
                        'sass-loader'
                    ]
                }
            ]
        },
        externals: {
            jquery: "jQuery",
            lodash: "lodash",
            "@wordpress/blocks": ["wp", "blocks"],
            "@wordpress/i18n": ["wp", "i18n"],
            "@wordpress/element": ["wp", "element"],
            "@wordpress/components": ["wp", "components"],
            "@wordpress/editor": ["wp", "editor"],
            "@wordpress/blob": ["wp", "blob"],
            "@wordpress/data": ["wp", "data"],
            "@wordpress/html-entities": ["wp", "htmlEntities"],
            "@wordpress/url": ["wp", "url"],
        }
    };
    return config;
}