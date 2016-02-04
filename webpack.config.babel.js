import path from "path";
import WebpackNotifierPlugin from "webpack-notifier";

const config = {
  entry: path.resolve(__dirname, "src/flowtip.js"),
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "flowtip.js",
    library: "flowtip",
    libraryTarget: "umd"
  },
  externals: {
    "react": "react",
    "react-dom": "react-dom"
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
