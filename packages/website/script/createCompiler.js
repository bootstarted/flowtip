// @flow

// flowlint untyped-import: off
import webpack from 'webpack';
import createContext from 'webpack-dev-middleware/lib/context';
import reporter from 'webpack-dev-middleware/lib/reporter';
import {setFs} from 'webpack-dev-middleware/lib/util';
// flowlint untyped-import: error

// flowlint unclear-type: off
const createCompiler = (config: Object) => {
  // flowlint unclear-type: error
  const compiler = webpack(config);
  const context = createContext(compiler, {
    reporter,
    stats: {
      colors: true,
      context: process.cwd(),
    },
    watchOptions: {
      aggregateTimeout: 200,
    },
  });

  const watching = compiler.watch({}, (error) => {
    if (error) {
      context.log.error(error.stack || error);
      if (error.details !== undefined) {
        context.log.error(error.details);
      }
    }
  });

  setFs(context, compiler);

  return {compiler, watching, context};
};

export default createCompiler;
