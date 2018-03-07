// @flow

// flowlint untyped-import: off
import evalModule from 'eval';
// flowlint untyped-import: error
import path from 'path';

import type {WebpackStats} from '../types';

const resolveModulePath = (fs, modulePath) => {
  const filePath = path.resolve(__dirname, modulePath);
  if (!fs.statSync(filePath).isDirectory()) return filePath;
  return path.join(filePath, 'index.js');
};

const getModule = (fs, cache, modulePath) => {
  const filePath = resolveModulePath(fs, modulePath);

  if (cache[filePath]) return cache[filePath];

  const content = fs.readFileSync(filePath);
  const exports = evalModule(content, filePath, {}, true);
  cache[filePath] = exports;

  return exports;
};

// flowlint unclear-type: off
const watchCompiler = (compiler: Object) => {
  // flowlint unclear-type: error
  let stats = null;
  let cache = {};
  let handlers = [];

  compiler.plugin('invalid', () => {
    stats = null;
    cache = {};
  });

  compiler.plugin('emit', (compilation, done) => {
    const nextStats = (stats = compilation.getStats());
    handlers.forEach((handler) => handler(nextStats));
    handlers = [];
    done();
  });

  // flowlint unclear-type: off
  const currentStats = (): Promise<Object> =>
    // flowlint unclear-type: error
    new Promise((resolve) => {
      if (stats) resolve(stats);
      else handlers.push(resolve);
    });

  return {
    // flowlint unclear-type: off
    stats: async (options?: Object): Promise<WebpackStats> => {
      const stats = await currentStats();
      // flowlint unclear-type: error
      return stats.toJson(options);
    },
    // flowlint unclear-type: off
    import: async (modulePath: string): Promise<Object> => {
      // flowlint unclear-type: error
      await currentStats();
      return getModule(compiler.outputFileSystem, cache, modulePath);
    },
  };
};

export default watchCompiler;
