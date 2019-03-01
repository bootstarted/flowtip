module.exports = (api) => {
  console.log('babel config', process.env.NODE_ENV);
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
      '@babel/preset-typescript',
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      [
        'babel-plugin-module-resolver',
        {
          cwd: __dirname,
          extensions: ['.tsx', '.ts', '.js'],
        },
      ],
    ],
  };
  if (process.env.NODE_ENV === 'test') {
    out.plugins.push('@babel/plugin-transform-modules-commonjs');
  }
  return out;
};
