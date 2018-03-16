// @flow

import PagesPlugin from 'pages-webpack-plugin';

import path from 'path';

import config from './client.babel';

config.plugins.push(
  new PagesPlugin({
    name: '[path][name].[ext]',
    paths: ['/', '/error/404.html'],
    mapStatsToProps: (stats) => {
      return {stats: stats.toJson()};
    },
    render: require(path.join(config.context, 'dist', 'render')).default,
    mapResults(results) {
      return results.map((result) => {
        return {...result, filename: `${result.filename}`};
      });
    },
  }),
);

export default config;
