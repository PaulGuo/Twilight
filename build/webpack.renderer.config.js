'use strict';

process.env.BABEL_ENV = 'renderer';

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const BabiliWebpackPlugin = require('babili-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const env = process.env.NODE_ENV || 'development';

let whiteListedModules = ['vue'];

const common = {
    target: 'electron-renderer',
    entry: {
        renderer: path.join(__dirname, '../src/renderer/index.js')
    },
    module: {
        rules: [
            {
                test: /\.(js|vue)$/,
                enforce: 'pre',
                exclude: /node_modules/,
                use: {
                    loader: 'eslint-loader',
                    options: {
                        formatter: require('eslint-friendly-formatter')
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.html$/,
                use: 'vue-html-loader'
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            scss: 'vue-style-loader!css-loader!sass-loader'
                        }
                    }
                }
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    query: {
                        name: 'imgs/[name].[ext]'
                    }
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    query: {
                        name: 'fonts/[name].[ext]'
                    }
                }
            }
        ]
    },
    node: {
        __dirname: process.env.NODE_ENV !== 'production',
        __filename: process.env.NODE_ENV !== 'production'
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env)
        }),
        new HtmlWebpackPlugin({
            filename: 'renderer.html',
            template: path.resolve(__dirname, '../src/renderer/index.html'),
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true
            }
        })
    ],
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '../dist')
    },
    resolve: {
        alias: {
            '@renderer': path.join(__dirname, '../src/renderer')
        },
        extensions: ['.js', '.vue', '.json', '.css', '.node']
    }
};
const dev = webpackMerge(common, {
    cache: true,
    devtool: 'eval-source-map',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin()
    ]
});
const prod = webpackMerge(common, {
    plugins: [
        new BabiliWebpackPlugin({
            removeConsole: true,
            removeDebugger: true
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        })
    ],
    bail: true
});

let conf;
switch (env) {
    case 'production':
        conf = prod;
        break;
    case 'development':
        conf = dev;
        break;
}

module.exports = conf;
