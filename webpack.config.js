const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const nodeModules = {};
fs.readdirSync('node_modules')
.filter(x => ['.bin'].indexOf(x) === -1)
.forEach(mod => {
    nodeModules[mod] = `commonjs ${mod}`;
});

module.exports = {
    context: path.resolve(__dirname),
    entry: './index.js',
    output: {
        path: path.join(__dirname, 'es5'),
        filename: 'component.js',
        libraryTarget: 'commonjs2',
    },
    resolve: {
        root: path.resolve(__dirname),
    },
    node: {
        fs: 'empty',
    },
    plugins: {
        optimizations: [
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                output: {
                    comments: false,
                },
                compress: {
                    warnings: false,
                },
            }),
        ],
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
            },
        ],
    },
    externals: nodeModules,
};
