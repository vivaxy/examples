/**
 * @since 2020-03-08 08:02
 * @author vivaxy
 */
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: 'dist/',
  },
  mode: 'development',
  devtool: 'source-map',
};
