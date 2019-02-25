module.exports = (api) => {
  api.cache(() => process.env.NODE_ENV);
  const out = {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
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
  };
  if (process.env.NODE_ENV === 'test') {
    out.plugins.push('@babel/plugin-transform-modules-commonjs');
  }
  if (process.env.NODE_ENV === 'lib') {
    out.plugins.push('@babel/plugin-transform-modules-commonjs', [
      'module-resolver',
      {},
    ]);
  }
  if (process.env.NODE_ENV === 'es') {
    out.plugins.push(['module-resolver', {}]);
  }
  return out;
};
