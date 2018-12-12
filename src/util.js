"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const child_process_1 = require("child_process");
const merge = require("lodash.merge");
const which = require("which");
exports.bangFile = (fname, fcontent) => {
    'use strict';
    if (!fs.existsSync(fname)) {
        console.log('Creating ' + fname);
        if (typeof fcontent === 'function') {
            fs.writeFileSync(fname, fcontent(), 'utf-8');
        }
        else {
            fs.writeFileSync(fname, fcontent, 'utf-8');
        }
    }
};
exports.banDir = (dname) => {
    'use strict';
    if (!fs.existsSync(dname)) {
        fs.mkdirSync(dname);
    }
};
exports.bangModules = (modules, mode) => {
    const needInstalls = [];
    for (const m of modules) {
        if (!fs.existsSync(path.resolve('node_modules', m))) {
            needInstalls.push(m);
        }
    }
    if (needInstalls.length > 0) {
        let cmd = `${exports.pkger(mode === 'dev' ? 'install-dev' : 'install')} `;
        cmd += needInstalls.join(' ');
        console.log(cmd);
        child_process_1.execSync(cmd);
    }
};
exports.bangJSON = (file, props) => {
    let obj = {};
    if (fs.existsSync(file)) {
        obj = JSON.parse(fs.readFileSync(file).toString());
    }
    merge(obj, props);
    fs.writeFileSync(file, JSON.stringify(obj, null, '  '));
};
exports.bangPackage = (props) => {
    module.exports.bangJSON('./package.json', props);
};
let pkg = 'npm';
if (which.sync('yarn', { nothrow: true }) !== null) {
    pkg = 'yarn';
}
;
exports.pkger = (cmd) => {
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
};
//# sourceMappingURL=util.js.map