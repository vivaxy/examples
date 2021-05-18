/**
 * @since 2021-05-12
 * @author vivaxy
 */
module.exports = {
  entry: './index.js',
  mode: process.env.NODE_ENV,
  output: {
    filename: 'bundle.js',
    path: __dirname,
  },
  devtool:
    process.env.NDOE_ENV === 'development' ? 'eval-source-map' : 'source-map',
};
