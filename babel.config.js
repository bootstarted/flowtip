module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        shippedProposals: true,
        targets: {
          node: 8,
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-flow',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    [
      'module-resolver',
      {
        cwd: 'babelrc',
        alias: {
          '^(flowtip-core|flowtip-react-dom)/(lib|es|src)($|/.*$)':
            './packages/\\1/src/\\3',
          '^(flowtip-core|flowtip-react-dom)$': './packages/\\1/src',
        },
      },
    ],
  ],
  env: {
    test: {
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    },
    lib: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
        ['module-resolver', {}],
      ],
    },
    es: {
      plugins: [['module-resolver', {}]],
    },
  },
};
