/**
 * @since 2015-12-07 16:43
 * @author vivaxy
 */
'use strict';
module.exports = {
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: './[name].js',
  },
  module: {
    loaders: [
      {
        test: /src\/.+\.js?$/,
        loader: 'babel?presets[]=es2015',
      },
    ],
  },
};
