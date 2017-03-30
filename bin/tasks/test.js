import path from 'path'
import {log} from '../utils/process'
import {exists, readJSONTMPL, getFileExt, mkdir} from '../utils/file'

import karmaConfig from '../drivers/karma.config'
import karma from 'gulp-karma-runner'
import jasmine from 'gulp-jasmine-node'

export default function(commander) {
    commander
    .command('test')
	.description('link local componout as package')
    .option('-D, --debug', 'whether to use browser to debug code')
	.option('-b, --browser [browser]', 'which browser to use select one from [PhantomJS|Chrome|Firefox]')
	.action(options => {
        let cwd = process.cwd()
        let jsonfile = path.join(cwd, 'componer.json')

        if(!exists(jsonfile)) {
            log('There is no componer.json in current directory.', 'error')
            return
        }

        let info = readJSONTMPL(jsonfile, {
            'path': cwd,
        })
        let settings = info.test

        if(!info) {
            log('Build option is not found in componer.json.', 'error')
            return
        }

        let entryfile = path.join(cwd, settings.entry)

        if(info.browsers === 'Terminal') {
    		return gulp.src(entryfile).pipe(jasmine({
    			timeout: 10000,
    			includeStackTrace: false,
    			color: process.argv.indexOf('--color')
    		}))
    	}

        let reportersDir = info.reporters
    	if(!reportersDir) {
    		log('test.reporters option is not correct in your componer.json', 'error')
    		return
    	}

    	let reportersPath = path.join(cwd, reportersDir)
    	if(!exists(reportersPath)) {
    		mkdir(reportersPath)
    	}

    	let preprocessors = {}
    	preprocessors[cwd + '/**/*.js'] = ['webpack', 'sourcemap']
    	preprocessors[cwd + '/**/*.scss'] = ['scss']

    	let karmaSettings = {
    			singleRun: options.debug !== undefined ? !options.debug : !info.debug,
    			browsers: options.browser ? [options.browser] : info.browsers,
    			preprocessors: preprocessors,
    			coverageReporter: {
    				reporters: [
    					{
    						type: 'html',
    						dir: reportersPath,
    					},
    				],
    			},
    			htmlReporter: {
    				outputDir: reportersPath,
    				reportName: settings.name,
    			},
    		}

    	let entryfiles = [entryfile]
    	// if use PhantomJS to test, it do not support new functions directly, use babal-polyfill to fix
    	// in fact, lower version of Chrome or Firefox are not support to. however, developer should make sure to use higher version of this browsers
    	let launchers = karmaSettings.browsers
        let root = path.resolve(__dirname, '../..')
    	if(launchers.indexOf('PhantomJS') > -1 || launchers.indexOf('IE') > -1 || launchers.indexOf('Safari') > -1) {
    		entryfiles.unshift(path.join(root, 'node_modules/core-js/es6/symbol.js'))
    	}

    	return gulp.src(entryfiles)
    		.pipe(karma.server(karmaConfig(karmaSettings)))
    		.on('end', () => {
    			log('Reporters ware created in componouts/' + name + '/' + reportersDir, 'help')
    			exit()
    		})

    })
}
