/* eslint-env node */
require('@babel/register')({
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  // Necessary when running scripts in a particular package that needs access
  // to other packages (i.e. those outside its "root").
  rootMode: 'upward',
  cache: process.env.NODE_ENV !== 'production',
  // TODO: Look into this. It's necessary because the default hooks set this
  // to the root, and with `rootMode: 'upward'` requiring things outside the
  // root fails, UNLESS this is here. I feel like we can make the expression
  // slightly better though.
  only: [/packages\//],
  ignore: [/node_modules/, /dist/],
});
