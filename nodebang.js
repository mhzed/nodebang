#!/usr/bin/env node

var fs = require("fs")
var path = require("path")

const yargs = require("yargs")
  .usage("Usage: $0 [opitons]")
  .option('typescript', {
    alias: 't',
    describe: 'init for typescript project'
  })
  .option('help', {
    alias: 'h',
    describe: 'print help'
  })
  .help();
const argv = yargs.argv;

if (argv.help) {
  console.log(yargs.help());
  process.exit(0);
}

if (argv.typescript) {
  console.log("Initializing for typescript");
} else {
  console.log("Initializing for javascript");
}

const bangFile = (fname, fcontent) => {
  "use strict";
  if (!fs.existsSync(fname)) {
    console.log("Creating " + fname);
    if (typeof fcontent === 'function') {
      fs.writeFileSync(fname, fcontent(), "utf-8");
    } else {
      fs.writeFileSync(fname, fcontent, "utf-8");
    }
  }
}

bangFile(".gitignore", "*.map\nnode_modules/\nbower_components/");
bangFile(".npmignore", "*.map\n*.coffee\ntest/\nnode_modules/\nbower_components/");
bangFile("README.md", () => {
  "use strict";
  let name = path.basename(process.cwd());
  return name + "\n--------\n\n";
})

if (argv.typescript) {
  bangFile('tsconfig.json', `
  {
  "compilerOptions": {
    "target": "es6",
    "moduleResolution": "node",
    "module": "commonjs",
    "inlineSourceMap" : true
    }
  }
  `);
  bangFile('tslint.json', `
  {
    "rules": {
      "max-line-length": {
        "options": [
          120
        ]
      },
      "new-parens": true,
      "no-arg": true,
      "no-bitwise": true,
      "no-conditional-assignment": true,
      "no-consecutive-blank-lines": false,
      "no-console": false
    },
    "jsRules": {
      "max-line-length": {
        "options": [
          120
        ]
      }
    }
  }  
  `);
} else {
  bangFile(".eslintrc.js", `
    module.exports = {
      "extends": "standard",
      "installedESLint": true,
      "plugins": [
          "standard",
          "promise"
      ],
      "rules": {
          "space-before-function-paren": 0,
          "one-var" : 0,
          "semi": 0,
          "quotes": 0
      }
  
    };
    `
  );
}

if (!fs.existsSync("package.json")) {
  console.log("You need to run: npm init");
}

console.log("Done");
