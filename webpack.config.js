const path = require('path');

module.exports = {
  module: {
    loaders: [
      { test: /\.js$/, exclude: /(vendor|node_modules)/, loader: 'babel-loader'}
    ]
  },
  entry: {
    application: "./src/index",
    demo: "./src/demo",
  },

  resolve: {
    alias: {
      soundfonts: path.join(__dirname, "vendor/soundfonts"),
      midi: path.join(__dirname, "vendor/midi"),
      util: path.join(__dirname, "vendor/util"),
    },
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].entry.js"
  }
};
