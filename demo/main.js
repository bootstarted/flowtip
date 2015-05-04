require.config({
  paths: {
    "react": "../node_modules/react/dist/react-with-addons",
    "JSXTransformer": "../node_modules/react/dist/JSXTransformer",
    "jsx": "../node_modules/requirejs-react-jsx/jsx",
    "text": "../node_modules/requirejs-text/text",

    "jquery": "../node_modules/jquery/dist/jquery",
    "underscore": "../node_modules/underscore/underscore",

    // "flowtip-root": "../lib/flowtip-root",
    // "flowtip-tail": "../lib/flowtip-tail",
    // "flowtip-content": "../lib/flowtip-content",
    // "flowtip": "../lib/flowtip",

    "flowtip": "../flowtip"
  },

  shim : {
    "react": {
      "exports": "React"
    },
    "JSXTransformer": "JSXTransformer"
  },

  jsx: {
    fileExtension: ".jsx",
    transformOptions: {
      harmony: true,
      stripTypes: false,
      inlineSourceMap: true
    },
    usePragma: false
  }
});

require(["jsx!app"], function(App){
  App.startDemo();
});
