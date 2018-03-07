#!/usr/bin/env node -r @std/esm -r @babel/register -r regenerator-runtime/runtime
// @flow

// flowlint untyped-import: off
import serve from 'webpack-serve';
import compress from 'koa-compressor';
import logger from 'koa-logger';
// flowlint untyped-import: error

import clientConfig from '../config/client.babel';
import renderConfig from '../config/render.babel';
import renderMiddleware from './renderMiddleware';
import createCompiler from './createCompiler';

const {compiler: renderCompiler} = createCompiler(renderConfig);

serve({
  config: clientConfig,
  port: process.env.PORT,
  hot: __DEV__ ? {} : false,
  logLevel: __DEV__ ? 'trace' : 'info',
  add: (app, middleware, options) => {
    app.use(compress());
    app.use(logger());
    middleware.webpack();
    middleware.content();
    app.use(renderMiddleware(options.compiler, renderCompiler));
  },
});
