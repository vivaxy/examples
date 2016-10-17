/**
 * @since 2016-10-17 14:12
 * @author vivaxy
 */

module.exports = {
    entry: './source.js',
    output: {
        path: __dirname,
        filename: './index.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: [
                    'babel',
                ]
            },
        ]
    }
};
