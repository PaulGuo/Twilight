'use strict';

process.env.BABEL_ENV = 'main';

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BabiliWebpackPlugin = require('babili-webpack-plugin');

const env = process.env.NODE_ENV || 'development';

const common = {
    target: 'electron-main',
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '../dist'),
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                enforce: 'pre',
                exclude: /node_modules/,
                use: {
                    loader: 'eslint-loader',
                    options: {
                        formatter: require('eslint-friendly-formatter'),
                    },
                },
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.node$/,
                use: 'node-loader',
            },
        ],
    },
    node: {
        __dirname: process.env.NODE_ENV !== 'production',
        __filename: process.env.NODE_ENV !== 'production',
    },
    resolve: {
        alias: {
            '@main': path.join(__dirname, '../src/main'),
        },
        extensions: ['.js', '.json', '.node'],
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env),
        }),
    ],
};
const dev = webpackMerge(common, {
    entry: {
        main: path.join(__dirname, '../src/main/index.dev.js'),
    },
    cache: true,
    devtool: 'eval-source-map',
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
    ],
});
const prod = webpackMerge(common, {
    entry: {
        main: path.join(__dirname, '../src/main/index.js'),
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: path.join(
                    __dirname,
                    '../src/third-party/visualmetrics/visualmetrics.py'
                ),
                to: path.join(
                    __dirname,
                    '../dist/third-party/visualmetrics/visualmetrics.py'
                ),
            },
            {
                from: path.join(__dirname, '../src/main/help.html'),
                to: path.join(__dirname, '../dist/help.html'),
            },
        ]),
        new BabiliWebpackPlugin({
            removeConsole: true,
            removeDebugger: true,
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        }),
    ],
    bail: true,
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
