nodebang
--------

The big-bang for node project.

In current dir, it tries to:

- create .gitignore, if not exists
- create .npmignore, if not exists
- create README.md, if not exists
- create .eslint.js if a js project
- or create tsconfig.json and tslint.json if a ts project
- prompt to call "npm init", if package.json does not exists

