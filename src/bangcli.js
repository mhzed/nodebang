#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Yargs = require("yargs");
const bang_1 = require("./bang");
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
});
const argv = yargs.argv;
if (argv.help) {
    yargs.showHelp();
    process.exit(0);
}
bang_1.bangBasic();
bang_1.bangTypescript();
if (argv.react) {
    bang_1.bangReact();
}
console.log('Done');
//# sourceMappingURL=bangcli.js.map