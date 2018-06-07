"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Plugin = /** @class */ (function () {
    function Plugin() {
    }
    Plugin.makeReg = function (fileName) {
        return new RegExp("<link[^>]+href=['\"]" + fileName + "['\"][^>]+(>|\\\\>|><\\/link>)");
    };
    Plugin.getStyleString = function (modules) {
        return modules
            .filter(function (_a) {
            var _b = _a.type, type = _b === void 0 ? '' : _b;
            return type.includes('mini-css-extract-plugin');
        })
            .reduce(function (result, _a) {
            var _b = _a.content, content = _b === void 0 ? '' : _b;
            return result + content;
        }, '');
    };
    Plugin.addStyleInToHTML = function (compilation, pluginData) {
        var style = this.getStyleString(compilation.modules);
        pluginData.html = pluginData.html
            .replace('</head>', "<style>\n" + style + "\n</style></head>");
    };
    Plugin.removeLinkTag = function (pluginData) {
        var _this = this;
        pluginData.assets.css.forEach(function (fileName) {
            pluginData.html = pluginData.html
                .replace(_this.makeReg(fileName), '');
        });
    };
    Plugin.replace = function (compilation, pluginData, callback) {
        Plugin.removeLinkTag(pluginData);
        Plugin.addStyleInToHTML(compilation, pluginData);
        callback(null, pluginData);
    };
    Plugin.prototype.apply = function (compiler) {
        compiler.hooks.compilation.tap('HtmlReplaceWebpackPlugin', function (compilation) {
            compilation.hooks.htmlWebpackPluginAfterHtmlProcessing
                .tapAsync('html-webpack-plugin-before-html-processing', Plugin.replace.bind(Plugin, compilation));
        });
    };
    return Plugin;
}());
exports.default = Plugin;
//# sourceMappingURL=index.js.map