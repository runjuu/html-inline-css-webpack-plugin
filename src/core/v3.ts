import { SyncHook } from 'tapable'
import { Compiler } from 'webpack'

import { TAP_KEY_PREFIX } from '../types'
import { BasePlugin } from './base-plugin'

interface HtmlWebpackPluginData {
  html: string
  outputName: string
  assets: {
    publicPath: string
    css: string[]
  }
}

export class PluginForHtmlWebpackPluginV3 extends BasePlugin {
  private process(data: HtmlWebpackPluginData) {
    // check if current html needs to be inlined
    if (this.isCurrentFileNeedsToBeInlined(data.outputName)) {
      const [...cssAssets] = data.assets.css
      cssAssets.forEach(cssLink => {
        const style = this.getCSSStyle({
          cssLink,
          publicPath: data.assets.publicPath,
        })

        if (style) {
          data.html = this.addStyle({
            html: data.html,
            htmlFileName: data.outputName,
            style: style,
          })

          const cssLinkIndex = data.assets.css.indexOf(cssLink)
          // prevent generate <link /> tag
          if (cssLinkIndex !== -1) {
            data.assets.css.splice(cssLinkIndex, 1)
          }
        }
      })

      data.html = this.cleanUp(data.html)
    }
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(
      `${TAP_KEY_PREFIX}_compilation`,
      (compilation) => {
        if ('htmlWebpackPluginBeforeHtmlProcessing' in compilation.hooks) {
          const hook: SyncHook<HtmlWebpackPluginData> =
            // @ts-ignore Error:(130, 27) TS2339: Property 'htmlWebpackPluginBeforeHtmlProcessing' does not exist on type 'CompilationHooks'.
            compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing
          hook.tap(
            `${TAP_KEY_PREFIX}_htmlWebpackPluginBeforeHtmlProcessing`,
            (data: HtmlWebpackPluginData) => {
              this.prepare(compilation)
              this.process(data)
            },
          )
        } else {
          throw new Error(
            '`html-webpack-plugin` should be ordered first before html-inline-css-webpack-plugin',
          )
        }
      },
    )
  }
}
