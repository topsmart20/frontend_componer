var bowerJson = require("./bower.json")
var packageJson = require("./package.json")

module.exports = {
	name: "{{componout-name}}",
	build: [
		{
			from: "src/script/{{componout-name}}.js",
			to: "dist/js/{{componout-name}}.js",
			options: {
				minify: true,
				sourcemap: "file",
			},
			settings: {
				get externals: function() {
					var deps = Object.keys(bowerJson.dependencies).contact(Object.keys(packageJson.dependencies))
					var externals = {}
					if(deps.length > 0) deps.forEach(dep => externals[dep] = dep)
					return externals
				},
			},
		},
		{
			from: "src/style/{{componout-name}}.scss",
			to: "dist/css/{{componout-name}}.css",
			options: {
				minify: true,
				sourcemap: "file",
			},
		},
	],
	preview: {
		index: "preview/index.jade",
		script: "preview/{{componout-name}}.js",
		style: "preview/{{componout-name}}.scss",
		server: "preview/server.js",
		watch: [
			"preview/index.jade",
			"preview/{{componout-name}}.js",
			"preview/{{componout-name}}.scss",
			"src/**/*",
		],
	},
	test: {
		entry: "test/specs/{{componout-name}}.js",
		reporters: "test/reporters",
		debug: false,
		browsers: ["PhantomJS"],
	},
}