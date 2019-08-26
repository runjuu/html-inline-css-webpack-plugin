import { SyncHook } from 'tapable'
import { Compiler } from 'webpack'
import HTMLWebpackPlugin = require('html-webpack-plugin')

import { TAP_KEY_PREFIX } from '../types'
import { BasePlugin } from './base-plugin'

interface BeforeAssetTagGenerationData {
  outputName: string
  assets: {
    publicPath: string
    css: string[]
  }
  plugin: HTMLWebpackPlugin
}

interface BeforeEmitData {
  html: string
  outputName: string
  plugin: HTMLWebpackPlugin
}

interface HTMLWebpackPluginHooks {
  beforeAssetTagGeneration: SyncHook<BeforeAssetTagGenerationData>
  beforeEmit: SyncHook<BeforeEmitData>
}

type CSSStyle = string

export class PluginForHtmlWebpackPluginV4 extends BasePlugin {
  // Using object reference to distinguish styles for multiple files
  private cssStyleMap: Map<HTMLWebpackPlugin, CSSStyle[]> = new Map()

  private prepareCSSStyle(data: BeforeAssetTagGenerationData) {
    data.assets.css.forEach((cssLink, index) => {
      if (this.isCurrentFileNeedsToBeInlined(cssLink)) {
        const style = this.getCSSStyle({
          cssLink,
          publicPath: data.assets.publicPath,
        })

        if (style) {
          if (this.cssStyleMap.has(data.plugin)) {
            this.cssStyleMap.get(data.plugin)!.push(style)
          } else {
            this.cssStyleMap.set(data.plugin, [style])
          }

          // prevent generate <link /> tag
          data.assets.css.splice(index, 1)
        }
      }
    })
  }

  private process(data: BeforeEmitData) {
    // check if current html needs to be inlined
    if (this.isCurrentFileNeedsToBeInlined(data.outputName)) {
      const cssStyles = this.cssStyleMap.get(data.plugin) || []

      cssStyles.forEach((style) => {
        data.html = this.addStyle({
          style,
          html: data.html,
          htmlFileName: data.outputName,
        })
      })

      data.html = this.cleanUp(data.html)
    }
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(
      `${TAP_KEY_PREFIX}_compilation`,
      (compilation) => {
        const hooks: HTMLWebpackPluginHooks = (HTMLWebpackPlugin as any).getHooks(
          compilation,
        )

        hooks.beforeAssetTagGeneration.tap(
          `${TAP_KEY_PREFIX}_beforeAssetTagGeneration`,
          (data) => {
            this.prepare(compilation)
            this.prepareCSSStyle(data)
          },
        )

        hooks.beforeEmit.tap(`${TAP_KEY_PREFIX}_beforeEmit`, (data) => {
          this.process(data)
        })
      },
    )
  }
}
