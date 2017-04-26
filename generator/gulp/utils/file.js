import path from 'path'
import fs from 'fs'
import shell from 'shelljs'
import reload from 'require-reload'

export function exists(file) {
	if(typeof file !== 'string') return
	return fs.existsSync(file)
}

export function isFile(file) {
	if(!exists(file)) return
	return fs.lstatSync(file).isFile()
}

export function isDir(dir) {
	if(!exists(dir)) return
	return fs.lstatSync(dir).isDirectory()
}

export function isSymLink(file) {
	if(!exists(file)) return
	return fs.lstatSync(file).isSymbolicLink()
}

export function read(file) {
	if(!exists(file)) return
	return fs.readFileSync(file).toString()
}

export function readJSON(file) {
	if(!exists(file)) return
	return JSON.parse(read(file))
}

export function readTMPL(file, parsers) {
	if(!exists(file)) return
	var content = read(file)
	var keys = Object.keys(parsers)
	keys.forEach(key => {
		let value = parsers[key]
		let reg = new RegExp('\\\[' + key + '\\\]', 'g')
		content = content.replace(reg, value)
	})
	return content
}

export function readJSONTMPL(file, parsers) {
	if(!exists(file)) return
	return JSON.parse(readTMPL(file, parsers))
}

export function write(file, content) {
	fs.writeFileSync(file, content)
}

export function writeJSON(file, json) {
	write(file, JSON.stringify(json, null, 4))
}

export function symlink(from, to) {
    if(!exists(from)) return
    fs.symlinkSync(from, to, isDir(from) ? 'dir' : 'file')
}

export function unSymlink(symlink) {
	if(!isSymLink(symlink)) return
	remove(symlink)
}

export function scandir(dir) {
	if(!exists(dir)) return
	return fs.readdirSync(dir)
}

export function clear(dir) {
	if(!exists(dir)) return
	shell.exec('cd ' + dir + ' && rm -rf * && rm -rf .??*')
}

export function remove(file) {
	var filename = path.basename(file)
	var dirname = path.dirname(file)
	shell.exec(`cd "${dirname}" && rm -rf ${filename}`)
}

export function mkdir(dir) {
	if(exists(dir)) return
	fs.mkdirSync(dir)
}

export function rename(file, newfile) {
	if(!exists(file)) return
	fs.renameSync(file, newfile)
}

export function copy(from, to) {
	shell.exec(`cp -rf "${from}" "${to}"`)
}

export function load(file, useDefault = true) {
	if(!exists(file)) return
	var rs = reload(file)
	if(typeof rs === 'object') {
		if(useDefault && rs.default) return rs.default
		else return rs
	}
	return rs
}

export function getFileExt(file, maxnum = 1) {
	let ext = file.substr(file.lastIndexOf('.'))
	if(maxnum > 1) for(let i = maxnum;i > 1;i --) {
		ext = ext.substr(ext.lastIndexOf('.'))
	}
	return ext
}

/**
 * @param array search: an array to put possible value to find, if the first value not found, the next value will be use, until find a value
 */
export function setFileExt(file, ext, search) {
	let last = file.lastIndexOf('.')
	if(search && Array.isArray(search)) for(let reg of search) {
		let found = file.lastIndexOf(reg)
		if(found > -1) {
			last = found
			break
		}
	}
	return file.substr(0, last) + ext
}

let contents = {}
export function hasFileChanged(file) {
	let content = read(file)
	if(contents[file] && contents[file] === content) return false
	contents[file] = content
	return true
}
