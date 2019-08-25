import { SyncHook } from 'tapable'
import { Compiler } from 'webpack'
import { escapeRegExp } from 'lodash'

interface File {
  [key: string]: string
}

interface Asset {
  source(): string
  size(): number
}

interface Compilation {
  assets: { [key: string]: Asset }
}

interface HtmlWebpackPluginData {
  html: string
  outputName: string
  assets: {
    publicPath: string
    css: string[]
  }
}

interface ReplaceConfig {
  position?: 'before' | 'after'
  removeTarget?: boolean
  target: string
}

interface Config {
  filter?(fileName: string): boolean
  leaveCSSFile?: boolean
  replace?: ReplaceConfig
}

const DEFAULT_REPLACE_CONFIG: ReplaceConfig = {
  target: '</head>',
}

export default class Plugin {
  static addStyle(html: string, style: string, replaceConfig: ReplaceConfig) {
    const styleString = `<style type="text/css">${style}</style>`
    const replaceValues = [styleString, replaceConfig.target]

    if (replaceConfig.position === 'after') {
      replaceValues.reverse()
    }

    return html.replace(replaceConfig.target, replaceValues.join(''))
  }

  static removeLinkTag(html: string, cssFileName: string) {
    return html.replace(
      new RegExp(
        `<link[^>]+href=['"]${cssFileName}['"][^>]+(>|\/>|><\/link>)`,
        'g',
      ),
      '',
    )
  }

  static cleanUp(html: string, replaceConfig: ReplaceConfig) {
    return replaceConfig.removeTarget
      ? html.replace(replaceConfig.target, '')
      : html
  }

  private css: File = {}

  constructor(private readonly config: Config = {}) {}

  private getCSSFile(cssLink: string, publicPath: string) {
    // Link pattern: publicPath + fileName + '?' + hash
    const fileName = cssLink
      .replace(new RegExp(`^${escapeRegExp(publicPath)}`), '')
      .replace(/\?.+$/g, '')

    return this.css[fileName]
  }

  private isCurrentFileNeedsToBeInlined(fileName: string): boolean {
    if (typeof this.config.filter === 'function') {
      return this.config.filter(fileName)
    } else {
      return true
    }
  }

  private prepare({ assets }: Compilation) {
    const isCSS = is('css')

    Object.keys(assets).forEach((fileName) => {
      if (isCSS(fileName) && this.isCurrentFileNeedsToBeInlined(fileName)) {
        this.css[fileName] = assets[fileName].source()
        if (!this.config.leaveCSSFile) {
          delete assets[fileName]
        }
      }
    })
  }

  private process(data: HtmlWebpackPluginData) {
    const { replace: replaceConfig = DEFAULT_REPLACE_CONFIG } = this.config

    // check if current html needs to be inlined
    if (this.isCurrentFileNeedsToBeInlined(data.outputName)) {
      data.assets.css.forEach((cssLink) => {
        data.html = Plugin.addStyle(
          data.html,
          this.getCSSFile(cssLink, data.assets.publicPath),
          replaceConfig,
        )
      })

      data.html = Plugin.cleanUp(data.html, replaceConfig)
      data.assets.css.length = 0 // prevent generate <link /> tag
    }
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(
      'html-inline-css-webpack-plugin',
      (compilation) => {
        if ('htmlWebpackPluginBeforeHtmlProcessing' in compilation.hooks) {
          const hook: SyncHook<HtmlWebpackPluginData> =
            // @ts-ignore Error:(130, 27) TS2339: Property 'htmlWebpackPluginBeforeHtmlProcessing' does not exist on type 'CompilationHooks'.
            compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing
          hook.tap(
            'html-inline-css-webpack-plugin-html-webpack-plugin-before-html-processing',
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

function is(filenameExtension: string) {
  const reg = new RegExp(`\.${filenameExtension}$`)
  return (fileName: string) => reg.test(fileName)
}
