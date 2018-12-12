#!/usr/bin/env node
import * as Yargs from "yargs";
import { bangTypescript, bangBasic, bangReact } from "./bang";

const yargs = Yargs
  .usage('Usage: $0 [opitons]')
  .option('react', {
    alias: 'r',
    describe: 'install react for typescript'
  })
  .option('help', {
    alias: 'h',
    describe: 'print help'
  })
  .help("create typescript project")

const argv = yargs.argv
if (argv.help) {
  console.log(yargs.help())
  process.exit(0)
}
bangBasic();
bangTypescript();

if (argv.react) {
  bangReact(); 
}

console.log('Done')
