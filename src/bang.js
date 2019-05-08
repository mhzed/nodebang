"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const child_process_1 = require("child_process");
const util_1 = require("./util");
function bangBasic() {
    if (!fs.existsSync('package.json')) {
        console.log('init package.json');
        child_process_1.execSync(util_1.pkger('init'));
    }
    util_1.banDir('src');
    util_1.banDir('test');
    util_1.bangPackage({ private: true });
    util_1.bangFile('LICENSE', util_1.loadFile('res/LICENSE'));
    util_1.bangFile('.gitignore', '.nyc_output\ncoverage/\nnode_modules/\nbower_components/\ndist/');
    util_1.bangFile('.npmignore', '.nyc_output\ncoverage/\ntest/\nnode_modules/\nbower_components/\ndist/');
}
exports.bangBasic = bangBasic;
function bangTypescript() {
    console.log('Initializing for typescript');
    util_1.bangFile('tsconfig.json', util_1.loadFile('res/tsconfig.json'));
    util_1.bangFile('tsconfig.base.json', util_1.loadFile('res/tsconfig.base.json'));
    util_1.bangFile('tslint.json', util_1.loadFile('res/tslint.json'));
    util_1.bangFile('index.ts', '');
    util_1.bangFile('test/test.ts', util_1.loadFile('res/test.ts'));
    util_1.bangModules(['typescript', '@types/node', 'ts-node', 'mocha', '@types/mocha',
        'source-map-support', 'tslint', 'nyc', 'should', 'tslint-microsoft-contrib'], 'dev');
    util_1.bangPackage({ scripts: {
            test: "nyc mocha --require ts-node/register test/**/*.ts",
            testcover: "nyc --reporter=lcov mocha --require ts-node/register test/**/*.ts",
            lint: 'tslint --project .',
            tswatch: "tsc --watch",
            repository: ""
        } });
}
exports.bangTypescript = bangTypescript;
function bangReact() {
    console.log('Installing react for typescript ....');
    util_1.banDir('src/assets');
    util_1.bangFile('src/tsconfig.json', util_1.loadFile('res/ts-react/tsconfig.json'));
    util_1.bangModules(['react', 'react-dom', 'react-router-dom', 'lodash-es']);
    util_1.bangModules(['webpack', '@types/webpack', 'ts-node', '@types/react', '@types/react-dom', '@types/react-router-dom',
        'ts-loader', 'source-map-loader', 'null-loader', 'react-dom', 'webpack-dev-server', 'webpack-cli', 'file-loader',
        'url-loader', 'style-loader', 'css-loader', 'sass-loader', 'node-sass', 'uglifyjs-webpack-plugin',
        'copy-webpack-plugin', '@types/lodash-es', 'lodash', 'babel-runtime', 'dynamic-cdn-webpack-plugin', 'module-to-cdn',
        'html-webpack-plugin', 'fast-glob', 'fs-extra', '@types/fs-extra', 'webpack-bundle-analyzer',
        'webpack-why-plugin'], 'dev');
    util_1.bangFile('src/assets/index.html', util_1.loadFile('res/ts-react/index.html'));
    util_1.bangFile('src/index.tsx', util_1.loadFile('res/ts-react/index.tsx'));
    util_1.bangFile('src/app.tsx', util_1.loadFile('res/ts-react/app.tsx'));
    util_1.bangFile('webpack.config.ts', util_1.loadFile('res/ts-react/webpack.config.ts'));
    util_1.bangPackage({
        scripts: {
            'lint': 'tslint --project .',
            'build-all': 'webpack --env build=dev,release,dev-full,release-full',
            'build': 'webpack --env build=release',
            'build-analyze': 'webpack --env build=release --analyze',
            'build-clean': 'rm -rf ./dist',
            'serve': 'webpack-dev-server --inline --content-base src/'
        }
    });
    util_1.bangFile('README.md', () => {
        'use strict';
        let name = path.basename(process.cwd());
        let content = util_1.loadFile('res/ts-react/readme.md');
        return name + '\n--------\n\n' + content;
    });
    console.log(`"${util_1.pkger('')} run serve" to start dev server.`);
}
exports.bangReact = bangReact;
//# sourceMappingURL=bang.js.map