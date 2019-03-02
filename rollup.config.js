import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

import path from 'path';

export default {
  input: './src/index.tsx',
  output: [
    {
      file: './lib/index.js',
      format: 'cjs',
    },
    {
      file: './lib/index.es.js',
      format: 'esm',
    },
  ],
  external: ['react', 'react-dom', 'flowtip-core', 'react-resize-observer'],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      extensions: ['.tsx'],
      configFile: path.join(__dirname, 'babel.config.js'),
    }),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      browser: false,
      extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx'],
      preferBuiltins: true,
    }),
    commonjs({}),
  ],
};
