#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
const execSync = require('child_process').execSync
var {bangFile, banDir, bangModules, bangPackage} = require('./util')

const yargs = require('yargs')
  .usage('Usage: $0 [opitons]')
  .option('typescript', {
    alias: 't',
    describe: 'init for typescript project'
  })
  .option('react', {
    alias: 'r',
    describe: 'install react'
  })
  .option('help', {
    alias: 'h',
    describe: 'print help'
  })
  .help()
const argv = yargs.argv
if (argv.help) {
  console.log(yargs.help())
  process.exit(0)
}

bangFile('.gitignore', '*.map\nnode_modules/\nbower_components/\ndist/')
bangFile('.npmignore', '*.map\ntest/\nnode_modules/\nbower_components/\ndist/')
bangFile('README.md', () => {
  'use strict'
  let name = path.basename(process.cwd())
  return name + '\n--------\n\n'
})
if (!fs.existsSync('package.json')) {
  console.log('npm init ...')
  execSync('npm init --yes')
}
banDir('src')
banDir('test')

bangPackage({private: true})

if (argv.typescript) {
  console.log('Initializing for typescript')
  bangFile('tsconfig.json', `
  {
  "compilerOptions": {
    "target": "es6",
    "moduleResolution": "node",
    "module": "commonjs",
    "typeRoots": ["node_modules/@types"],
    "sourceMap" : true,
    "jsx": "react"
    }
  }
  `)
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
  `)
  bangFile('index.ts', '')
  bangModules(['typescript', '@types/node', 'nodeunit', '@types/nodeunit', 'tslint'], 'dev')
  bangPackage({scripts: {lint: 'tslint --project .'}})
} else {
  console.log('Initializing for javascript')
  bangFile('.eslintrc.js', `
    module.exports = {
      "extends": "standard",
      "installedESLint": true,
      "plugins": [
          "standard",
          "promise"
      ],
      "rules": {
          "one-var" : 0
      }
    };
    `
  )
  bangFile('index.js', '')
  bangModules(['eslint', 'nodeunit'], 'dev')
}

if (argv.react && argv.typescript) {
  console.log('Installing react for typescript ....')
  bangModules(['react', 'react-dom'])
  bangModules(['webpack', '@types/webpack', 'ts-node', '@types/react', '@types/react-dom', 'awesome-typescript-loader',
    'source-map-loader', 'null-loader', 'react-dom', 'webpack-dev-server', 'file-loader', 'url-loader', 'style-loader', 'css-loader',
    'sass-loader', 'node-sass', 'uglifyjs-webpack-plugin', 'copy-webpack-plugin', 'lodash'], 'dev')

  bangFile('src/index.html', `
  <!DOCTYPE html>
  <html>
      <head>
          <meta charset="UTF-8" />
          <title>Nodebang app</title>
      </head>
      <body>
          <div id="main"></div>
          <!-- Dependencies -->
          <!-- Main -->
          <script src="bundle.js"></script>
      </body>
  </html>  
  `)
  bangFile('src/index.tsx', `
  import * as React from "react";
  import * as ReactDOM from "react-dom";
  import { App } from "./app";
  ReactDOM.render(
      <App title="Nodebang app" />,
      document.getElementById("main")
  );
  `)
  bangFile('src/app.tsx', `
  import * as React from "react";
  export interface AppProps { title: string; }
  export class App extends React.Component<AppProps, {}> {
      render() {
          return <h1>App {this.props.title}!</h1>;
      }
  }
  `)
  bangFile('webpack.config.js', fs.readFileSync(path.resolve(__dirname, 'res/webpack.config.ts')))
  bangPackage({
    scripts: {
      'lint': 'tslint --project .',
      'buildall': 'webpack --env build=dev,cdn,release,release-cdn',
      'build': 'webpack --env build=release',
      'cleanbuild': 'rm -rf ./dist',
      'dev-serve': 'webpack-dev-server --inline --content-base src/'
    }
  })
}

console.log('Done')
