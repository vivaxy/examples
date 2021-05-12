/**
 * @since 2021-05-12
 * @author vivaxy
 */
module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: __dirname,
  },
  devtool: 'eval-cheap-source-map',
};
