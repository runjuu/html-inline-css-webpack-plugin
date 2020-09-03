import HTMLWebpackPlugin = require('html-webpack-plugin')

import {
  PluginForHtmlWebpackPluginV3,
  PluginForHtmlWebpackPluginV4,
} from './core'

const isHTMLWebpackPluginV4 = 'getHooks' in HTMLWebpackPlugin

export = isHTMLWebpackPluginV4
  ? PluginForHtmlWebpackPluginV4
  : PluginForHtmlWebpackPluginV3
