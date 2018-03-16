// @flow

// flowlint untyped-import: off
import CleanPlugin from 'clean-webpack-plugin';
// flowlint untyped-import: error

import path from 'path';
import base from './base';

const config = base();

const NAME = 'client';

const outputPath = path.join(config.context, 'dist', NAME);
const entryPath = path.join(config.context, 'src', NAME);

config.target = 'web';

config.entry = {
  index: entryPath,
};

config.output = {
  path: outputPath,
  filename: __DEV__ ? '[name].js' : '[name].[chunkHash].js',
  chunkFilename: __DEV__ ? '[name].js' : '[name].[chunkHash].js',
};

config.plugins.push(new CleanPlugin([outputPath], {root: config.context}));

export default config;
