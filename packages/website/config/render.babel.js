// @flow

// flowlint untyped-import: off
import CleanPlugin from 'clean-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
// flowlint untyped-import: error

import path from 'path';
import base from './base';

const config = base();

const NAME = 'render';

const outputPath = path.join(config.context, 'dist', NAME);
const entryPath = path.join(config.context, 'src', NAME);

config.target = 'node';
config.externals = [nodeExternals()];

config.entry = {
  index: entryPath,
};

config.output = {
  path: outputPath,
  filename: '[name].js',
  chunkFilename: '[name].js',
  library: 'render',
  libraryTarget: 'commonjs2',
};

config.plugins.push(new CleanPlugin([outputPath], {root: config.context}));

export default config;
