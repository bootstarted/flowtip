// @flow

import watchCompiler from './watchCompiler';

import type {Middleware} from 'koa';

// flowlint unclear-type: off
const renderMiddleware = (
  clientCompiler: Object,
  renderCompiler: Object,
): Middleware => {
  // flowlint unclear-type: error
  const watchClient = watchCompiler(clientCompiler);
  const watchRender = watchCompiler(renderCompiler);

  return async (ctx, next) => {
    const {method, path} = ctx.request;

    if (method === 'GET') {
      const stats = await watchClient.stats({
        source: false,
        chunks: false,
        modules: false,
        entrypoints: false,
        excludeAssets: (name) => /\.hot-update\./.test(name),
      });
      const render = await watchRender.import('../dist/render');

      const {markup} = await render.default({path, stats});
      ctx.body = markup;
    } else {
      next();
    }
  };
};

export default renderMiddleware;
