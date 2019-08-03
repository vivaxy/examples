/**
 * @since 2016-01-22 14:55
 * @author vivaxy
 */

'use strict';

const path = require('path');

const RELEASE_PATH = 'release';

module.exports = {
  entry: path.resolve(__dirname, './source/index.js'),
  output: {
    path: path.resolve(__dirname, RELEASE_PATH),
    publicPath: RELEASE_PATH,
    filename: 'index.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|release)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react'],
        },
      },
    ],
  },
};
