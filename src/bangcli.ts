#!/usr/bin/env node
import * as Yargs from "yargs";
import { bangTypescript, bangBasic, bangReact } from "./bang";

const yargs = Yargs
  .usage(`
Create typescript project.  
Usage: $0 [opitons]
  `)
  .option('react', {
    alias: 'r',
    describe: 'install react for typescript'
  })
  .option('help', {
    alias: 'h',
    describe: 'print help'
  })

const argv = yargs.argv
if (argv.help) {
  yargs.showHelp();
  process.exit(0)
}
bangBasic();
bangTypescript();

if (argv.react) {
  bangReact(); 
}

console.log('Done')
