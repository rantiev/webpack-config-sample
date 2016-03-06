'use strict';
const path = require('path');

const PATHS = {
    app: path.join(__dirname, '/app'),
    public: path.join(__dirname, '/public'),
    dist: 'dist'
};

const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const StringReplacePlugin = require("string-replace-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const buildMode = ~process.argv.indexOf('-prod') ? 'prod' : 'dev';
const bundleName = `${PATHS.dist}/[name].[hash].${buildMode === 'prod' ? 'min' : ''}`;
const jsBundleName = `${bundleName}.js`;
const cssBundleName = `${bundleName}.css`;

const buildCfg = {
    replacements: {
        prod: {
            apiUrl: 'http://google.com/api/',
            googleId: '100500',
            booblId: '15'
        },
        dev: {
            apiUrl: 'http://yandex.ru/api/',
            googleId: '100700',
            booblId: '17'
        }
    }
};

const replaceConfig = {
    replacements: []
};

for (var i in buildCfg.replacements[buildMode]) {

    (function () {

        var findStr = new RegExp(i + ":\\s*'.*?'");
        var replacementStr = i + ":'" + buildCfg.replacements[buildMode][i] + "'";

        replaceConfig.replacements.push({
            pattern: findStr,
            replacement: function (match) {
                return replacementStr;
            }
        });

    })();

}

let webpackConfig = {
    publicPath: '',
    entry: PATHS.app + '/app.js',
    output: {
        path: PATHS.public,
        filename: jsBundleName
    },
    debug: true,
    watch: false,
    module: {
        loaders: [{
            test: /\.js$/,
            loader: StringReplacePlugin.replace('babel?presets[]=es2015', replaceConfig)
        }, {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract(['css-loader', 'autoprefixer-loader?browsers=last 5 version', 'sass-loader'])
        }, {
            test: /\.html$/,
            loader: 'underscore-template-loader'
        }]
    },
    plugins: [
        new ExtractTextPlugin(cssBundleName),
        new CleanWebpackPlugin(['public/dist'], {
            root: __dirname,
            verbose: true,
            dry: false
        }),
        new HtmlWebpackPlugin({
            title: 'SPA App',
            filename: 'index.html',
            template: 'tpl/index.html',
            inject: 'body',
            minify: buildMode === 'prod' ? {
                removeComments: true,
                collapseWhitespace: true
            } : false,
            favicon: 'img/favicon.ico',
            buildMode: buildMode,
            analytics: {
                google: true
            }
        }),
        new StringReplacePlugin(),
    ]
};

if (buildMode === 'prod') {
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = webpackConfig;
