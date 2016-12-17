import {gulp, path, fs, args, logger, config, exit} from "../loader"
import {isValidName, hasComponent, dashlineName, runTask} from "../utils"

import TsServer from "ts-server"

module.exports = function() {
	var arg = args.preview
	var name = arg.name
	
	if(!isValidName(name)) {
		exit()
	}
	if(!hasComponent(name)) {
		exit()
	}

	name = dashlineName(name)
	var componentPath = path.join(config.paths.components, name)
	var srcPath = path.join(componentPath, "src")
	var previewPath = path.join(componentPath, "preview")
	var distPath = path.join(componentPath, "dist")

	if(!fs.existsSync(previewPath)) {
		logger.error(`Error: component ${name} has no preveiw directory.`)
		exit()
	}

	gulp.watch([srcPath + "/**/*"], event => {
		logger.help('File ' + event.path + ' was ' + event.type + ', running tasks...')
		runTask("build", {
			name: name
		})
	})

	if(!fs.existsSync(distPath)) {
		runTask("build", {
			name: name
		})
	}

	var $server = new TsServer()
	var port = Math.floor(Math.random() * 1000) + 8000
	$server.setup({
		port: port,
		root: config.paths.root,
		open: `${config.dirs.components}/${name}/preview/index.html`,
		livereload: {
			port: port + Math.floor(Math.random() * 10),
			directory: `${componentPath}`,
			filter: function (file) {
				var filepos = file.replace(componentPath, "")
				var sep = path.sep
				if(filepos.indexOf(sep + "dist") === 0 || filepos.indexOf(sep + "preview") === 0) {
					return true
				}
				else { 
					return false
				}
			},
		},
	})

}