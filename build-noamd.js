({
  baseUrl: "lib",
  exclude: ["JSXTransformer", "jsx", "jquery", "underscore", "react"],
  include: [
    "jquery", "underscore", "react",
    "jsx!flowtip"
  ],
  optimize: "none",

  paths: {
    "react": "../node_modules/react/dist/react-with-addons",
    "JSXTransformer": "../node_modules/react/dist/JSXTransformer",
    "jsx": "../node_modules/requirejs-react-jsx/jsx",
    "text": "../node_modules/requirejs-text/text",

    "jquery": "../node_modules/jquery/dist/jquery",
    "underscore": "../node_modules/underscore/underscore",

    "flowtip-root": "../lib/flowtip-root",
    "flowtip-tail": "../lib/flowtip-tail",
    "flowtip-content": "../lib/flowtip-content",
    "flowtip": "../lib/flowtip"
  },

  shim : {
    "react": { "exports": "React" },
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
  },

  onBuildWrite: function (moduleName, path, singleContents) {
    return singleContents.replace(/jsx!/g, '');
  },

  wrap: {
    start: "(function(namespace, jquery, underscore, React) {",
    end: "namespace.FlowTip = flowtip; }(window, $, _, React));"
  },

  onModuleBundleComplete: function (data) {
    if (data.path.match(/\/[^\/]*noamd[^\/]*\.js$/)) {
      var fs = module.require('fs'),
        amdclean = module.require('amdclean'),
        outputFile = data.path,
        cleanedCode = amdclean.clean({ 'filePath': outputFile });

      fs.writeFileSync(outputFile, cleanedCode);
    }
  }
})
