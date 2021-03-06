#!/usr/bin/env node
import * as Yargs from "yargs";
import { bangTypescript, bangBasic, bangReact } from "./bang";
import { bangPython } from "./bangPython";
import * as fse from "fs-extra";
import { bangJava } from "./bangJava";
const yargs = Yargs
  .usage(`
Create typescript/python project.  
Usage: nodebang [opitons] dir
  `)
  .option('ts', {
    alias: 't',
    describe: 'create typescript project',
    boolean: true
  })
  .option('react', {
    alias: 'r',
    describe: 'install react for typescript',
    boolean: true
  })
  .option('py', {
    alias: 'p',
    describe: 'create python project',
    boolean: true
  })
  .option('java', {
    alias: 'j',
    describe: 'create java(maven) project',
    boolean: true
  })
  .option('help', {
    alias: 'h',
    describe: 'print help',
    boolean: true
  })

const argv = yargs.argv
if (argv.help || argv._.length != 1) {
  yargs.showHelp();
  process.exit(0)
}
const [dir] = argv._;
fse.mkdirpSync(dir);
process.chdir(dir);
console.log(`\nExploding in dir ${process.cwd()}`)
if (argv.java) {
  bangJava();
} else if (argv.py) {
  bangPython();
} else if (argv.ts) {
  bangBasic();
  bangTypescript();
  if (argv.react) {
    bangReact();
  }
} else {
  yargs.showHelp();
  process.exit(0)
}
