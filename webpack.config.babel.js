import path from "path";
import WebpackNotifierPlugin from "webpack-notifier";

const config = {
  entry: path.resolve(__dirname, "src/flowtip.js"),
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "flowtip.js",
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
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel" }
    ]
  }
};

export default config;
