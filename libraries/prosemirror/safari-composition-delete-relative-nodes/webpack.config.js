/**
 * @since 2021-05-12
 * @author vivaxy
 */
import path from 'path';

const dirname = path.dirname(import.meta.url).slice('file://'.length);

export default {
  entry: './index.js',
  mode: process.env.NODE_ENV,
  output: {
    filename: 'bundle.js',
    path: dirname,
  },
  devtool:
    process.env.NODE_ENV === 'development' ? 'eval-source-map' : 'source-map',
  devServer: {
    static: {
      directory: dirname,
    },
    open: true,
  },
};
