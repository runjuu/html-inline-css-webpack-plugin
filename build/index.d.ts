import { Compiler } from 'webpack';
interface Module {
    type?: string;
    content: string;
}
interface Compilation {
    modules: Module[];
}
interface PluginData {
    html: string;
    assets: {
        css: string[];
    };
}
export default class Plugin {
    static makeReg(fileName: string): RegExp;
    static getStyleString(modules: Module[]): string;
    static addStyleInToHTML(compilation: Compilation, pluginData: PluginData): void;
    static removeLinkTag(pluginData: PluginData): void;
    static replace(compilation: Compilation, pluginData: PluginData, callback: (...args: any[]) => void): void;
    apply(compiler: Compiler): void;
}
export {};
