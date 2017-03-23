import Bufferify from 'webpack-bufferify'

export default class WebPackPluginCMD extends Bufferify {
    process(content, file, assets, compilation) {
        if(compilation.options.output.libraryTarget === 'umd') {
            content = content
                .replace("typeof define === 'function' && define.amd", "typeof define === 'function' && define.amd && define.cmd")
                .replace('"function"==typeof define&&define.amd', '"function"==typeof define&&define.amd&&define.cmd')
        }
        return content
    }
}
