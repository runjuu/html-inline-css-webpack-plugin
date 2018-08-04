import { Compiler, Configuration } from 'webpack';

type File = {
  [key: string]: string
};

type Asset = {
  source(): string
  size(): number
};

interface Compilation {
  assets: { [key: string]: Asset }
}

export default class Plugin
{
  static addStyle(html: string, style: string) {
    return html.replace('</head>', `<style>${style}</style></head>`);
  }

  static removeLinkTag(html: string, cssFileName: string) {
    return html.replace(
      new RegExp(`<link[^>]+href=['"]${cssFileName}['"][^>]+(>|\/>|><\/link>)`),
      '',
    );
  }

  private css: File = {};
  private html: File = {};

  private prepare({ assets }: Compilation) {
    const isCSS = is('css');
    const isHTML = is('html');

    Object.keys(assets).forEach((fileName) => {
      if (isCSS(fileName)) {
        this.css[fileName] = assets[fileName].source();
        delete assets[fileName];
      } else if (isHTML(fileName)) {
        this.html[fileName] = assets[fileName].source();
      }
    });
  }

  private process({ assets }: Compilation, { output }: Configuration) {
    const publicPath = (output && output.publicPath) || '';
    Object.keys(this.html).forEach((htmlFileName) => {
      let html = this.html[htmlFileName];

      Object.keys(this.css).forEach((key) => {
        html = Plugin.addStyle(html, this.css[key]);
        html = Plugin.removeLinkTag(html, publicPath + key);
      });

      assets[htmlFileName] = {
        source() { return html },
        size() { return html.length },
      };
    });
  }

  apply(compiler: Compiler) {
    compiler.hooks.emit.tapAsync('html-inline-css-webpack-plugin', (compilation: Compilation, callback: () => void) => {
      this.prepare(compilation);
      this.process(compilation, compiler.options);
      callback();
    });
  }
}

function is(filenameExtension: string) {
  const reg = new RegExp(`\.${filenameExtension}$`);
  return (fileName: string) => reg.test(fileName);
}