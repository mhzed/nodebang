nodebang
--------

The big-bang for node project.

In current dir, it tries to:

- create .gitignore, if not exists
- create .npmignore, if not exists
- create README.md, if not exists
- create .eslint.js if a javascript project
- or create tsconfig.json and tslint.json if a typescript project
- call "npm init --yes", if package.json does not exists
- create src/, test/ directories, index.js or index.ts file
- install typescript packages if a typescript project

Note you can customize the content of "package.json" created by "npm init --yes", see https://docs.npmjs.com/getting-started/using-a-package.json

## Usage

Initialize a javascript project:

    nodebang .
    
Initialize a typescript project:

    nodebang -t .

Initialize a typescript + react + webpack project:

    nodebang -tr .
