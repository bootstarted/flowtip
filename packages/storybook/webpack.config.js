const path = require('path');

module.exports = (baseConfig, env, config) => {
  // exclude 'babel-loader' so we can override it later
  // see: github.com/storybooks/storybook/issues/3346#issuecomment-425516669
  config.module.rules = config.module.rules.filter(
    (rule) =>
      !(
        rule.use &&
        rule.use.length &&
        rule.use.find(({loader}) => loader === 'babel-loader')
      ),
  );

  config.module.rules.push({
    test: /\.(ts|js)x?$/,
    exclude: /(node_modules|dist)/, // exclude any commonjs files
    loader: require.resolve('babel-loader'),
    options: {
      configFile: './babel.config.js',
    },
  });

  config.module.rules.push({
    test: /\.stories\.tsx$/,
    loader: require.resolve('@storybook/addon-storysource/loader'),
    options: {
      parser: 'typescript',
      prettierConfig: {
        printWidth: 80,
      },
    },
    enforce: 'pre',
  });

  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
