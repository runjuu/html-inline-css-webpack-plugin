# html-inline-css-webpack-plugin
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Runjuu/html-inline-css-webpack-plugin/pulls)
[![npm version](https://badge.fury.io/js/html-inline-css-webpack-plugin.svg)](https://badge.fury.io/js/html-inline-css-webpack-plugin)

Convert external style sheet(`<link rel="stylesheet"/>`) to internal style sheet(`<style>...<style/>`).

Require [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin) and [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)

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

## Config
```typescript
interface Config {
  filter?(fileName: string): boolean
}
```

### filter(optional)
Return `true` to make current file internal, otherwise ignore current file.

