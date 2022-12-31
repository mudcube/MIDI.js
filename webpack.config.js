const path = require('path');
const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const PACKAGE = require('./package.json');

const version = PACKAGE.version;
const date_now = new Date().toISOString().replace(/T.*/, '');

const BANNER = `
midicube ${version} built on ${date_now}.
`;

module.exports = {
    entry: './js/index.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'midicube.js',
        library: 'MIDI',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    mode: 'production',
    devtool: 'source-map',
    // mode: 'development',
    // devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /(node_modules|bower_components|soundfont|soundfonts)/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env',
                                {
                                    // do not transform modules; let webpack do it
                                    modules: false,
                                    useBuiltIns: 'usage',
                                    corejs: 3,
                                }
                            ],
                        ],
                        plugins: [
                            '@babel/plugin-transform-object-assign',
                            '@babel/plugin-proposal-export-namespace-from',
                        ],
                    },
                }],
            },
        ],
    },
    plugins: [
        new webpack.BannerPlugin({banner: BANNER}),
        new ESLintPlugin(),
    ],
};
