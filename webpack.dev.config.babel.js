import path from "path";
import WebpackNotifierPlugin from "webpack-notifier";

const config = {
  target: "web",
  entry: {
    app: [
      "webpack-dev-server/client?http://0.0.0.0:8080",,
      "./src/demo.js"
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
    extensions: ["", ".js"] // allow require without extension
  },
  plugins: [
    new WebpackNotifierPlugin({ title: "flowtip" })
  ],
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

