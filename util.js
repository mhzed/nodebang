const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync
const merge = require('lodash.merge')
module.exports.bangFile = (fname, fcontent) => {
  'use strict'
  if (!fs.existsSync(fname)) {
    console.log('Creating ' + fname)
    if (typeof fcontent === 'function') {
      fs.writeFileSync(fname, fcontent(), 'utf-8')
    } else {
      fs.writeFileSync(fname, fcontent, 'utf-8')
    }
  }
}
module.exports.banDir = (dname) => {
  'use strict'
  if (!fs.existsSync(dname)) {
    fs.mkdirSync(dname)
  }
}

/**
 *
 * @param {*} modules array of modules
 * @param {*} mode "dev" or null|undefined|''
 */
module.exports.bangModules = (modules, mode) => {
  const needInstalls = []
  for (const m of modules) {
    if (!fs.existsSync(path.resolve('node_modules', m))) {
      needInstalls.push(m)
    }
  }
  if (needInstalls.length > 0) {
    let cmd = `npm install ${needInstalls.join(' ')} --save`
    if (mode === 'dev') cmd += '-dev'
    console.log(cmd)
    execSync(cmd)
  }
}

module.exports.bangPackage = (props) => {
  const mpackage = JSON.parse(fs.readFileSync('./package.json'))
  merge(mpackage, props)
  fs.writeFileSync('./package.json', JSON.stringify(mpackage, null, '  '))
}
