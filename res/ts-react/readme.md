
## Project intro

This is a React based web-app.

Place all code and assets under "src/" and "src/assets".

The build output is under "dist/".

To build for release

    npm run bild

To build for all targets

    npm run buildall

"./dist/*-full" directories do not use CDN.  The rest use CDN.  CDN usage is always recommend BTW.

To develop, run

    npm run serve

Above command will launch a web-server, monitor "src/" folder, recompile if any source changes, and then auto refresh the browser.

A compile entry point is created for each 'index.tsx' file found (recursively) under src/.  A corresponding 'index.html' is create in the output with same relative path structure, the output ".js" file is placed under root output dir with file name being the direct parent folder name.

For example:

    ./src/admin/index.tsx
    ==bulid==>
    ./dist/release/admin/index.html 
    ./dist/release/admin.js

