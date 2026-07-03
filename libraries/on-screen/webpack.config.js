module.exports = {
  entry: './source.js',
  output: {
    path: __dirname,
    filename: './index.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['es3ify', 'babel'],
      },
    ],
  },
};
