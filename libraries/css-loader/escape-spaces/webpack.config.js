module.exports = {
  entry: './index.js',
  mode: process.env.NODE_ENV,
  output: {
    filename: 'bundle.js',
    path: __dirname,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    static: {
      directory: __dirname,
    },
    open: true,
  },
};
