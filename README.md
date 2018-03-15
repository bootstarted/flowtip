# FlowTip

_A flexible, adaptable, and easy to use tooltip positioning library._

![build status](http://img.shields.io/travis/metalabdesign/flowtip/master.svg?style=flat)
![coverage](http://img.shields.io/coveralls/metalabdesign/flowtip/master.svg?style=flat)

## Packages

FlowTip is managed as a monorepo that is composed of several npm packages.

| Package               | Version                                                                                                                                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`flowtip-core`]      | [![npm](https://img.shields.io/npm/v/flowtip-core.svg?maxAge=2592000)](https://www.npmjs.com/package/flowtip-core) [![downloads](http://img.shields.io/npm/dm/flowtip-core.svg?style=flat)](https://www.npmjs.com/package/flowtip-core)                     |
| [`flowtip-react-dom`] | [![npm](https://img.shields.io/npm/v/flowtip-react-dom.svg?maxAge=2592000)](https://www.npmjs.com/package/flowtip-react-dom) [![downloads](http://img.shields.io/npm/dm/flowtip-react-dom.svg?style=flat)](https://www.npmjs.com/package/flowtip-react-dom) |

#### [`flowtip-core`]

This package contains the layout resolver algorithm.

The resolver algorithm has no binding to React or to the DOM. It is simply a pure function that calculates the current layout state for a set of provided measurements.

#### [`flowtip-react-dom`]

A FlowTip Component for [React DOM] using [`flowtip-core`] internally.

[`flowtip-core`]: /packages/flowtip-core
[`flowtip-react-dom`]: /packages/flowtip-react-dom
[react dom]: https://facebook.github.io/react/docs/react-dom.html
