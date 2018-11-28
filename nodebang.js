#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
const execSync = require('child_process').execSync
var {bangFile, banDir, bangModules, bangPackage, bangJSON} = require('./util')

const loadFile = (relpath) => {
  return fs.readFileSync(path.resolve(__dirname, relpath))
}
const yargs = require('yargs')
  .usage('Usage: $0 [opitons]')
  .option('typescript', {
    alias: 't',
    describe: 'init for typescript project'
  })
  .option('react', {
    alias: 'r',
    describe: 'install react for typescript'
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

if (!fs.existsSync('package.json')) {
  console.log('npm init ...')
  execSync('npm init --yes')
}
banDir('src')
banDir('src/assets')
banDir('test')

bangPackage({private: true})

if (argv.typescript) {
  bangFile('.gitignore', '.nyc_output\ncoverage/\nnode_modules/\nbower_components/\ndist/')
  bangFile('.npmignore', 'test/\nnode_modules/\nbower_components/\ndist/')

  console.log('Initializing for typescript')
  bangFile('tsconfig.json', loadFile('res/tsconfig.json'))
  bangFile('tslint.json', loadFile('res/tslint.json'))

  bangFile('index.ts', '')
  bangModules(['typescript', '@types/node', 'ts-node', 'mocha', '@types/mocha', 
    'source-map-support', 'tslint', 'nyc', 'should'], 'dev')
  bangPackage({scripts: {
    test: "nyc mocha --require ts-node/register test/**/*.ts",
    testcover: "nyc --reporter=lcov mocha --require ts-node/register test/**/*.ts",
    lint: 'tslint --project .',
    tswatch: "tsc --watch"
  }})
} else {
  bangFile('.gitignore', 'node_modules/\nbower_components/\ndist/')
  bangFile('.npmignore', 'test/\nnode_modules/\nbower_components/\ndist/')
  console.log('Initializing for javascript')
  bangFile('.eslintrc.js', loadFile('res/eslintrc.js'))
  bangFile('index.js', '')
  bangModules(['eslint', 'mocha'], 'dev')
}

if (argv.react && argv.typescript) {
  console.log('Installing react for typescript ....')
  bangJSON('tsconfig.json',
    {
      'compilerOptions': {
        'target': 'es5',
        'moduleResolution': 'node',
        'module': 'commonjs',
        'sourceMap': true,
        'jsx': 'react',
        'lib': ['dom', 'es5', 'es2015.promise']
      }
    }
  )
  bangModules(['react', 'react-dom', 'react-router-dom'])
  bangModules(['webpack', '@types/webpack', 'ts-node', '@types/react', '@types/react-dom', 'awesome-typescript-loader',
    'source-map-loader', 'null-loader', 'react-dom', 'webpack-dev-server', 'webpack-cli', 'file-loader', 'url-loader', 'style-loader', 'css-loader',
    'sass-loader', 'node-sass', 'uglifyjs-webpack-plugin', 'copy-webpack-plugin', 'lodash', '@types/lodash',
    'babel-runtime', 'dynamic-cdn-webpack-plugin', 'module-to-cdn', 'html-webpack-plugin', 'fast-glob', 'fs-extra', '@types/fs-extra'], 'dev')

  bangFile('src/assets/index.html', loadFile('res/ts-react/index.html'))
  bangFile('src/index.tsx', loadFile('res/ts-react/index.tsx'))
  bangFile('src/app.tsx', loadFile('res/ts-react/app.tsx'))
  bangFile('src/common.tsx', loadFile('res/ts-react/common.tsx'))
  bangFile('webpack.config.ts', loadFile('res/ts-react/webpack.config.ts'))
  bangPackage({
    scripts: {
      'lint': 'tslint --project .',
      'buildall': 'webpack --env build=dev,release,dev-full,release-full',
      'build': 'webpack --env build=release',
      'cleanbuild': 'rm -rf ./dist',
      'serve': 'webpack-dev-server --inline --content-base src/'
    }
  })
  bangFile('README.md', () => {
    'use strict'
    let name = path.basename(process.cwd())
    let content = loadFile('res/ts-react/readme.md');
    return name + '\n--------\n\n' + content;
  })
  
  console.log('"npm run serve" to start dev server.')
} else {
  bangFile('README.md', () => {
    'use strict'
    let name = path.basename(process.cwd())
    return name + '\n--------\n\n';
  })
  
}

console.log('Done')
