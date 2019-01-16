import { Compiler } from 'webpack';
interface ReplaceConfig {
    position?: 'before' | 'after';
    removeTarget?: boolean;
    target: string;
    leaveCssFile?: boolean;
}
interface Config {
    filter?(fileName: string): boolean;
    replace?: ReplaceConfig;
}
export default class Plugin {
    private readonly config;
    static addStyle(html: string, style: string, replaceConfig: ReplaceConfig): string;
    static removeLinkTag(html: string, cssFileName: string): string;
    static cleanUp(html: string, replaceConfig: ReplaceConfig): string;
    private css;
    private html;
    constructor(config?: Config);
    private filter;
    private prepare;
    private process;
    apply(compiler: Compiler): void;
}
export {};
