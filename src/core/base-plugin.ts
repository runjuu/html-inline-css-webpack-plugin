import type { Compilation } from 'webpack'

import {
  type Config,
  type StyleTagFactory,
  DEFAULT_REPLACE_CONFIG,
  type FileCache,
  type ReplaceConfig,
} from '../types'
import { isCSS, escapeRegExp } from '../utils'

export class BasePlugin {
  private publicPathRegexMap = new Map<string, RegExp>()
  protected readonly replaceConfig: ReplaceConfig
  protected readonly styleTagFactory: StyleTagFactory

  protected cssStyleCache: FileCache = {}

  constructor(protected readonly config: Config = {}) {
    this.replaceConfig = config.replace || DEFAULT_REPLACE_CONFIG
    this.styleTagFactory =
      config.styleTagFactory ||
      (({ style }) => `<style type="text/css">${style}</style>`)
  }

  protected prepare({ assets }: Compilation) {
    for (const fileName of Object.keys(assets)) {
      if (isCSS(fileName) && this.isCurrentFileNeedsToBeInlined(fileName)) {
        const source = assets[fileName].source()
        this.cssStyleCache[fileName] =
          typeof source === 'string' ? source : source.toString()

        if (!this.config.leaveCSSFile) {
          delete assets[fileName]
        }
      }
    }
  }

  protected getCSSStyle({
    cssLink,
    publicPath,
  }: {
    cssLink: string
    publicPath: string
  }): string | undefined {
    let publicPathRegex = this.publicPathRegexMap.get(publicPath)
    if (publicPathRegex === undefined) {
      publicPathRegex = new RegExp(`^${escapeRegExp(publicPath)}`)
      this.publicPathRegexMap.set(publicPath, publicPathRegex)
    }
    // Link pattern: publicPath + fileName + '?' + hash
    const fileName = cssLink.replace(publicPathRegex, '').replace(/\?.+$/g, '')

    if (this.isCurrentFileNeedsToBeInlined(fileName)) {
      const style = this.cssStyleCache[fileName]

      if (style === undefined) {
        console.error(
          `Can not get css style for ${cssLink}. It may be a bug of html-inline-css-webpack-plugin.`,
        )
      }

      return style
    } else {
      return undefined
    }
  }

  protected isCurrentFileNeedsToBeInlined(fileName: string): boolean {
    if (typeof this.config.filter === 'function') {
      return this.config.filter(fileName)
    } else {
      return true
    }
  }

  protected addStyle({
    html,
    htmlFileName,
    style,
  }: {
    html: string
    htmlFileName: string
    style: string
  }) {
    const replaceValues = [
      this.styleTagFactory({ style }),
      this.replaceConfig.target,
    ]

    if (this.replaceConfig.position === 'after') {
      replaceValues.reverse()
    }

    const replaced = html.replace(
      this.replaceConfig.target,
      replaceValues.join(''),
    )
    if (replaced === html) {
      throw new Error(
        `Can not inject css style into "${htmlFileName}", as there is not replace target "${this.replaceConfig.target}"`,
      )
    }
    return replaced
  }

  protected cleanUp(html: string) {
    return this.replaceConfig.removeTarget
      ? html.replace(this.replaceConfig.target, '')
      : html
  }
}
