#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Yargs = require("yargs");
const bang_1 = require("./bang");
const bangPython_1 = require("./bangPython");
const fse = require("fs-extra");
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
    .option('help', {
    alias: 'h',
    describe: 'print help',
    boolean: true
});
const argv = yargs.argv;
if (argv.help || argv._.length != 1) {
    yargs.showHelp();
    process.exit(0);
}
const [dir] = argv._;
fse.mkdirpSync(dir);
process.chdir(dir);
console.log(`\nExploding in dir ${process.cwd()}`);
if (argv.py) {
    bangPython_1.bangPython();
}
else if (argv.ts) {
    bang_1.bangBasic();
    bang_1.bangTypescript();
    if (argv.react) {
        bang_1.bangReact();
    }
}
else {
    yargs.showHelp();
    process.exit(0);
}
//# sourceMappingURL=bangcli.js.map