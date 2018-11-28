
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

Above command will launch a web-server, monitor "src/" folder, recompile if any source changes.  Refresh in browser to reload.

By default the compiled output contains a single page "index.html".  If it's a multi-page app, then create files with name pattern "page*.tsx" under "src/" folder.  These page files will be compiled along index.tsx and a corresponding 'page*.html' file will also be generated.

