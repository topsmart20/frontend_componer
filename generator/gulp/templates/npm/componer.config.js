var packageJson = require("./package.json")

module.exports = {
	name: "{{componout-name}}",
	type: "npm package",
	build: [
		{
			from: "src/{{componout-name}}.js",
			to: "dist/{{componout-name}}.js",
			options: {
				minify: false,
				sourcemap: false,
			},
			settings: {
				get externals: function() {
					var deps = Object.keys(packageJson.dependencies)
					var externals = {}
					if(deps.length > 0) deps.forEach(dep => externals[dep] = dep)
					return externals
				},
			},
		}
	],
	test: {
		entry: "test/specs/{{componout-name}}.js",
		browsers: ["Terminal"],
	},
}
