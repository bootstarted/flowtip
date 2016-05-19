import path from "path";

const config = {
  target: "web",
  entry: {
    app: [
      "webpack-dev-server/client?http://0.0.0.0:8080",,
      "./demo/demo.js"
    ]
  },
  output: {
    path: path.join(__dirname, "demo"),
    filename: "demo.js",
    publicPath: "/",
    library: "flowtip",
    libraryTarget: "umd"
  },
  resolve: {
    alias: {},
    fallback: [path.join(__dirname, "node_modules")],
    extensions: ["", ".js"] // allow require without extension
  },
  module: {
    preLoaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "eslint" }
    ],
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel" }
    ]
  }
};

export default config;
