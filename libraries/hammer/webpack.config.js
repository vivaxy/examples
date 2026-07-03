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
