import {
  Config,
  StyleTagFactory,
  DEFAULT_REPLACE_CONFIG,
  FileCache,
} from '../types'
import { isCSS, escapeRegExp } from '../utils'

interface Asset {
  source(): string
  size(): number
}

interface Compilation {
  assets: { [key: string]: Asset }
}

export class BasePlugin {
  protected cssStyleCache: FileCache = {}

  protected get replaceConfig() {
    return this.config.replace || DEFAULT_REPLACE_CONFIG
  }

  protected get styleTagFactory(): StyleTagFactory {
    return (
      this.config.styleTagFactory ||
      (({ style }) => `<style type="text/css">${style}</style>`)
    )
  }

  constructor(protected readonly config: Config = {}) {}

  protected prepare({ assets }: Compilation) {
    Object.keys(assets).forEach((fileName) => {
      if (isCSS(fileName) && this.isCurrentFileNeedsToBeInlined(fileName)) {
        this.cssStyleCache[fileName] = assets[fileName].source()

        if (!this.config.leaveCSSFile) {
          delete assets[fileName]
        }
      }
    })
  }

  protected getCSSStyle({
    cssLink,
    publicPath,
  }: {
    cssLink: string
    publicPath: string
  }): string | undefined {
    // Link pattern: publicPath + fileName + '?' + hash
    const fileName = cssLink
      .replace(new RegExp(`^${escapeRegExp(publicPath)}`), '')
      .replace(/\?.+$/g, '')

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

    if (html.indexOf(this.replaceConfig.target) === -1) {
      return replaceValues.join('');
    }

    return html.replace(this.replaceConfig.target, replaceValues.join(''))
  }

  protected cleanUp(html: string) {
    return this.replaceConfig.removeTarget
      ? html.replace(this.replaceConfig.target, '')
      : html
  }
}
