import path from 'path'
import gulp from 'gulp'
import extend from 'extend'
import webpack from 'webpack-stream'
import bufferify from 'gulp-bufferify'
import webpackConfig from './webpack.config'
import {camelName} from '../utils/convert-name'
import {load} from '../utils/file'

/**
@param from: entry file absolute path,
@param to: output file absolute path,
@param options: {
    boolean sourcemap: whether to create a sourcemap file,
    boolean minify: whether to create a minified file,
    object vendors: the settings of vendors want to be seperated from source code, {context, path}
        {
            path:
            context:
        },
    boolean hashfile: whether to use hashed filename for output files

    function before(settings): function to run before build,
    function process(content, file, context): function to run before output with stream content,
    function after(): function to run after build,
}
@param settings: pass to webpack, will merge to defaults
@return streaming
**/

export default function(from, to, options = {}, settings  = {}) {
    var outputdir = path.dirname(to)
    var filename = path.basename(to)
    var name = path.basename(to, '.js')
    var defaults = {
        output: {
            filename: filename,
            library: camelName(name, true),
            sourceMapFilename: filename + '.map',
        },
        plugins: [],
    }

    settings = webpackConfig(extend(true, defaults, settings))

    if(options.sourcemap) {
        settings.devtool = options.sourcemap === true ? 'source-map' : options.sourcemap
    }

    if(options.minify) {
        settings.plugins.push(
            new webpack.webpack.optimize.UglifyJsPlugin({
                minimize: true,
            })
        )
    }

    if(options.vendors) {
        settings.plugins.push(
            new webpack.webpack.DllReferencePlugin({
                context: options.vendors.context,
                manifest: load(options.vendors.path),
            })
        )
    }

    if(options.hashfile) {
        let filename = settings.output.filename
        settings.output.filename = filename.substr(0, filename.lastIndexOf('.')) + '.[hash].js'
    }

    if(typeof options.before === 'function') {
        options.before(settings)
    }

    return gulp.src(from)
        .pipe(webpack(settings))
        .pipe(bufferify((content, file, context) => {
            if(typeof options.process === 'function') {
                content = options.process(content, file, context)
            }
            return content
        }))
        .pipe(gulp.dest(outputdir))
        .on('end', () => {
            if(typeof options.after === 'function') {
                options.after()
            }
        })
}
