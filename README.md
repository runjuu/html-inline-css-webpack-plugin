# html-inline-css-webpack-plugin
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Runjuu/html-inline-css-webpack-plugin/pulls)
[![npm version](https://badge.fury.io/js/html-inline-css-webpack-plugin.svg)](https://badge.fury.io/js/html-inline-css-webpack-plugin)

Convert `<link rel="stylesheet"/>` into `<style>...<style/>`

## Install
#### NPM
```bash
npm install html-inline-css-webpack-plugin -D
```
#### Yarn
```bash
yarn add html-inline-css-webpack-plugin -D
```

## Minimal example
```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new HtmlWebpackPlugin(),
    new HTMLInlineCSSWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      }
    ]
  }
}
```
