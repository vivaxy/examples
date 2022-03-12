/**
 * @since 2021-05-12
 * @author vivaxy
 */
const path = require('path');

module.exports = {
  entry: './client/index.js',
  mode: process.env.NODE_ENV,
  output: {
    filename: 'client/bundle.js',
    path: __dirname,
  },
  devtool:
    process.env.NODE_ENV === 'development' ? 'eval-source-map' : 'source-map',
  devServer: {
    static: {
      directory: __dirname,
    },
    open: '/client',
  },
};
