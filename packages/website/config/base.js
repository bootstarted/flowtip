// @flow

// flowlint untyped-import: off
import Webpack from 'webpack';
import nearest from 'find-nearest-file';
// flowlint untyped-import: error

import path from 'path';

const context = path.dirname(nearest('package.json'));

// flowlint unclear-type: off
const base = (): Object => ({
  // flowlint unclear-type: error
  context,
  mode: __DEV__ ? 'development' : 'production',
  devtool: __DEV__ ? 'source-map' : 'false',

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'source-map-loader',
        },
        enforce: 'pre',
      },
      {
        test: /\.js$/,
        include: [
          path.resolve(context, 'src'),
          path.resolve(context, '../../example'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['react-hot-loader/babel'],
          },
        },
      },
    ],
  },

  plugins: [
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
});

export default base;
