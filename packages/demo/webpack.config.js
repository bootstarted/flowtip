const loader = require('webpack-partial').loader;
const path = require('path');

const base = {
  context: __dirname,
  mode: 'development',
  entry: './src/demo.js',
  output: {
    path: path.join(__dirname, 'dist'),
  },
};

module.exports = loader(
  {
    loader: 'babel-loader',
    test: /\.js$/,
    options: {
      rootMode: 'upward',
    },
    exclude: [/node_modules/],
  },
  base,
);
