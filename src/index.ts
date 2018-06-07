import { Compiler } from 'webpack';

interface Module {
  type?: string
  content: string
}

interface Compilation {
  modules: Module[]
}

interface PluginData {
  html: string
  assets: { css: string[] }
}

export default class Plugin
{

  static makeReg(fileName: string) {
    return new RegExp(`<link[^>]+href=['"]${fileName}['"][^>]+(>|\/>|><\/link>)`);
  }

  static getStyleString(modules: Module[]): string {
    return modules
      .filter(({ type = '' }) => type.includes('mini-css-extract-plugin'))
      .reduce((result, { content = '' }) => {
        return result + content;
      }, '');
  }

  static addStyleInToHTML(compilation: Compilation, pluginData: PluginData) {
    const style = this.getStyleString(compilation.modules);
    pluginData.html = pluginData.html
      .replace('</head>', `<style>\n${style}\n</style></head>`);
  }

  static removeLinkTag(pluginData: PluginData) {
    pluginData.assets.css.forEach((fileName: string) => {
      pluginData.html = pluginData.html
        .replace(this.makeReg(fileName), '');
    });
  }

  static replace(compilation: Compilation, pluginData: PluginData, callback: (...args: any[]) => void) {
    Plugin.removeLinkTag(pluginData);
    Plugin.addStyleInToHTML(compilation, pluginData);
    callback(null, pluginData);
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('HtmlReplaceWebpackPlugin', (compilation: any) => {
      compilation.hooks.htmlWebpackPluginAfterHtmlProcessing
        .tapAsync(
          'html-webpack-plugin-before-html-processing',
          Plugin.replace.bind(Plugin, compilation)
        );
    });
  }
}