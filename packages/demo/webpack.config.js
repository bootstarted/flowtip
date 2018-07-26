import {loader} from 'webpack-partial';
import path from 'path';

const base = {
  context: __dirname,
  mode: 'development',
  entry: './src/demo.js',
  output: {
    path: path.join(__dirname, 'dist'),
  },
};

export default loader(
  {
    loader: 'babel-loader',
    test: /\.js$/,
    exclude: [/node_modules/],
  },
  base,
);
