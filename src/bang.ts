import * as fs from "fs";
import * as path from "path";
import { execSync } from 'child_process';
import { banDir, pkger, bangPackage, bangFile, bangModules, loadFile } from "./util";

export function bangBasic() {
  if (!fs.existsSync('package.json')) {
    console.log('init package.json')
    execSync(pkger('init'))
  }
  banDir('src')
  banDir('test')
  bangPackage({private: true})
  bangFile('LICENSE', loadFile('res/LICENSE'));
  
  bangFile('.gitignore', '.nyc_output\ncoverage/\nnode_modules/\nbower_components/\ndist/')
  bangFile('.npmignore', '.nyc_output\ncoverage/\ntest/\nnode_modules/\nbower_components/\ndist/')
}
export function bangTypescript() {

  console.log('Initializing for typescript')
  bangFile('tsconfig.json', loadFile('res/tsconfig.json'))
  bangFile('tsconfig.base.json', loadFile('res/tsconfig.base.json'))
  bangFile('tslint.json', loadFile('res/tslint.json'))
  
  bangFile('index.ts', '')
  bangFile('test/test.ts', loadFile('res/test.ts'))
  bangModules(['typescript', '@types/node', 'ts-node', 'mocha', '@types/mocha', 
    'source-map-support', 'tslint', 'nyc', 'should', 'tslint-microsoft-contrib'], 'dev')
  bangPackage({scripts: {
    test: "nyc mocha --require ts-node/register test/**/*.ts",
    testcover: "nyc --reporter=lcov mocha --require ts-node/register test/**/*.ts",
    lint: 'tslint --project .',
    tswatch: "tsc --watch",
    repository: ""
  }})  
}

export function bangReact() {
  console.log('Installing react for typescript ....')
  banDir('src/assets')
  bangFile('src/tsconfig.json', loadFile('res/ts-react/tsconfig.json'))  
  bangModules(['react', 'react-dom', 'react-router-dom', 'lodash-es'])
  bangModules(['webpack', '@types/webpack', 'ts-node', '@types/react', '@types/react-dom',  '@types/react-router-dom', 
    'ts-loader', 'source-map-loader', 'null-loader', 'react-dom', 'webpack-dev-server', 'webpack-cli', 'file-loader', 
    'url-loader', 'style-loader', 'css-loader', 'sass-loader', 'node-sass', 'uglifyjs-webpack-plugin', 
    'copy-webpack-plugin', '@types/lodash-es','lodash', 'babel-runtime', 'dynamic-cdn-webpack-plugin', 'module-to-cdn', 
    'html-webpack-plugin', 'fast-glob', 'fs-extra', '@types/fs-extra', 'webpack-bundle-analyzer', 
    'webpack-why-plugin'], 
    'dev')

  bangFile('src/assets/index.html', loadFile('res/ts-react/index.html'))
  bangFile('src/index.tsx', loadFile('res/ts-react/index.tsx'))
  bangFile('src/app.tsx', loadFile('res/ts-react/app.tsx'))
  bangFile('webpack.config.ts', loadFile('res/ts-react/webpack.config.ts'))
  bangPackage({
    scripts: {
      'lint': 'tslint --project .',
      'build-all': 'webpack --env build=dev,release,dev-full,release-full',
      'build': 'webpack --env build=release',
      'build-analyze': 'webpack --env build=release --analyze',
      'build-clean': 'rm -rf ./dist',
      'serve': 'webpack-dev-server --inline --content-base src/'
    }
  })
  bangFile('README.md', () => {
    'use strict'
    let name = path.basename(process.cwd())
    let content = loadFile('res/ts-react/readme.md');
    return name + '\n--------\n\n' + content;
  })
  
  console.log(`"${pkger('')} run serve" to start dev server.`)

}