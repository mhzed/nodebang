import * as fs from "fs";
import * as path from "path";
import { execSync } from 'child_process';
import * as merge from "lodash.merge";
import * as which from "which";

export const bangFile = (fname: string, fcontent: string | (()=>string) ): void => {
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
export const banDir = (dname:string): void => {
  'use strict'
  if (!fs.existsSync(dname)) {
    fs.mkdirSync(dname)
  }
}
/**
 *
 */
export const bangModules = (modules: string[], mode?: "dev"): void => {
  const needInstalls = []
  for (const m of modules) {
    if (!fs.existsSync(path.resolve('node_modules', m))) {
      needInstalls.push(m)
    }
  }
  if (needInstalls.length > 0) {
    let cmd = `${pkger(mode === 'dev' ? 'install-dev': 'install')} `
    cmd += needInstalls.join(' ');
    console.log(cmd)
    execSync(cmd)
  }
}
export const bangJSON = (file: string, props: any): void => {
  let obj = {}
  if (fs.existsSync(file)) { obj = JSON.parse(fs.readFileSync(file).toString()) }
  merge(obj, props)
  fs.writeFileSync(file, JSON.stringify(obj, null, '  '))
}

export const bangPackage = (props: any): void => {
  module.exports.bangJSON('./package.json', props)
}

let pkg = 'npm';  // defaults to npm
if (which.sync('yarn', {nothrow: true}) !== null) { 
  if (!fs.existsSync("./package-lock.json")) {
    pkg = 'yarn'
  }
};  // use yarn if available

export const pkger = (cmd: 'install' | 'install-dev' | 'init' | '')=>{
  switch (cmd) {
    case 'install': 
      return pkg == 'yarn' ? 'yarn add' : 'npm i';
    case 'install-dev': 
      return pkg == 'yarn' ? 'yarn add --dev' : 'npm i --save-dev';
    case 'init':
      return pkg == 'yarn' ? 'yarn init --yes' : 'npm init --yes';
    case '':
      return pkg;
    default:
     throw new Error("invalid " + cmd);
  }
}

export const loadFile = (relpath: string): string => {
  return fs.readFileSync(path.resolve(__dirname, "..", relpath)).toString()
}
