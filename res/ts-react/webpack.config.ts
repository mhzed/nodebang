import * as webpack from 'webpack';
import * as UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as _ from 'lodash';

/** 
 * Examples: 
 *    webpack -env build=dev
 *    webpack -env build=dev,release
 * 
 * dev: development build, bundle all src in original format
 * release: production build, output js is uglified and src removed from sourcemap
 * cdn: content devliery network build: externals are excluded from build, you must properly
 *      define "CdnExternals" below 
 * release-cdn: release + cdn
*/
type Target = 'dev' | 'cdn' | 'release' | 'release-cdn'

const CdnExternals = [
  {
    module: 'font-awesome/css/font-awesome.css',  // the import module name in js
    global: undefined,  // not applicable for css
    url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' // cdn url
  },
  {
    module: 'lodash',
    global: '_',      // the "imported as" variable in your code, installed by js below as global var 
    url: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js'  // the cnd url
  },
  {
    module: 'react',    // node_module name
    global: 'React',    // global var name
    url: 'https://cdnjs.cloudflare.com/ajax/libs/react/16.2.0/umd/react.production.min.js'
  },
  {
    module: 'react-dom',
    global: 'ReactDOM',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.2.0/umd/react-dom.production.min.js'
  }  
]

let NullCssLoaders = [];

// webpack.Configuration.ExternalsElement: excluded javascript modules
const Externals: webpack.ExternalsElement = _.reduce(CdnExternals, (acc, val)=>{
  if (!/\.s?css$/i.test(val.module))  // ignore .css or .scss in 'externals'
    acc[val.module] = val.global
  else    // instead add css to null loaders in cdn build
    NullCssLoaders.push({test: new RegExp(_.escapeRegExp(val.module)), use: 'null-loader'})
  return acc;
}, {});

// for transform index.html: embed external stylesheets and js files
const cdnTransform = (content: Buffer, path: string) => {
  if (/index\.html$/i.test(path)) 
    return content.toString().replace(/<!--\s*Dependencies\s*-->/i,
      _.join(_.map(CdnExternals, (m)=>{
        if (/\.s?css$/i.test(m.module))
          return `<link rel="stylesheet" type="text/css" href="${m.url}">`
        else
          return `<script src="${m.url}"></script>`
      }), "\n"));
  else
    return content
}
const BaseConfig: webpack.Configuration = {
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    //path
  },
  //devtool,
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, use: "awesome-typescript-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, use: "source-map-loader" },
      { test: /\.(s*)css$/, use: [ 'style-loader', 'css-loader','sass-loader' ] },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
        loader: "url-loader?limit=10000&mimetype=application/font-woff" },
      { test: /\.(ttf|eot|svg|png|jp(e*)g)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=2000" },
    ],
  },
  // plugins,
  //externals,
}

const merge = (target, ...src) => {
  return _.mergeWith(target, ...src, (dst, src) =>  {
    if (_.isArray(dst)) {
      return dst.concat(src)
    } else return undefined
  });
}
const createConfigFor = (target: Target): webpack.Configuration => {
  switch (target) {
    case 'dev':
      return merge({}, BaseConfig, {
        output: {path: __dirname + "/dist/dev"},
        devtool: 'eval-source-map',
        plugins: [new CopyWebpackPlugin(['src/index.html'])]        
      });
      
    case 'cdn':
      return merge({module: { rules: NullCssLoaders } }, BaseConfig, {
        output: {path: __dirname + "/dist/cdn"},
        devtool: 'source-map',
        externals: Externals,
        plugins: [
          new CopyWebpackPlugin([{ from: 'src/index.html', to: '', transform: cdnTransform}])
        ],
      });
    case 'release':
      return merge({}, BaseConfig, {
        output: {path: __dirname + "/dist/release"},
        devtool: 'nosources-source-map',
        plugins: [
          new CopyWebpackPlugin(['src/index.html']),
          new UglifyJsPlugin({
            sourceMap: true,
            uglifyOptions: {}
          })]
      });
    case 'release-cdn':
      return merge({module: { rules: NullCssLoaders } }, BaseConfig, {
        output: {path: __dirname + "/dist/release-cdn"},
        devtool: 'nosources-source-map',
        plugins: [
          new CopyWebpackPlugin([{ from: 'src/index.html', to: '', transform: cdnTransform}]),
          new UglifyJsPlugin({
            sourceMap: true,
            uglifyOptions: {}
          })
        ],
        externals: Externals
      });    
    default:
      throw new Error(`Unknow build target ${target}`);
  }
}

module.exports = (env, arg): Promise<webpack.Configuration[]> => {
  return (async function() {
    let targets = ['dev'];
    let buildtarget = _.find(_.flatten([env]), (e) => /^build=/.test(e));
    if (buildtarget) {
      targets = /^build=(.+)$/.exec(buildtarget)[1].split(',');
    }
    let configs = targets.map((t: Target) => createConfigFor(t));
    return configs;
  })();
}