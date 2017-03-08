/**
 * @since 2017-03-08 09:47
 * @author vivaxy
 */

const path = require('path');

module.exports = {
    entry: {
        'index': [
            './index.js'
        ],
    },
    output: {
        path: '.',
        filename: '[name].build.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'index.js'),
                ],
                loaders: [
                    'babel-loader',
                ],
            },
        ]
    },
};
