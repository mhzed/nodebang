import * as webpack from 'webpack';
import * as UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as _ from 'lodash';
import * as Path from 'path';
import * as Glob from 'fast-glob';
import * as Fs from "fs-extra";
import * as DynamicCdnWebpackPlugin from 'dynamic-cdn-webpack-plugin';

/** 
 * Examples: 
 *    webpack -env build=dev
 *    webpack -env build=dev,release
 * 
 * dev: development build, bundle all src in original format, using cdn
 * release: production build, output js is uglified and src removed from sourcemap, using cdd
 * *-full: same as above but without using cdn
*/
type Target = 'dev' | 'release' | 'dev-full' | 'release-full'

const SrcDir = Path.join(__dirname, "./src");
const DistDir = Path.join(__dirname, "./dist");
const DefaultHtmlTemplate = Path.join(SrcDir, "assets", "index.html");

const cdnPlugin = new DynamicCdnWebpackPlugin({
  resolver: require("module-to-cdn")
}) // use cdn

// config merge helper
const cfgMerge = (target, ...src) => {
  return _.mergeWith(target, ...src, (dst, src) =>  {
    if (_.isArray(dst)) {
      return dst.concat(src)
    } else return undefined
  });
}

// the common configuration
const BaseConfig: webpack.Configuration = {
  entry: {
    "index": Path.join(SrcDir, "index.tsx"),    
  },
  output: {
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
  plugins: [
    new HtmlWebpackPlugin({
      template: DefaultHtmlTemplate,
      chunks: ['index'],
    })
  ]
  //externals,
}

// scan for all page*.tsx fiels in src/ dir, set as entries (to be compiled) and also generate a html file for each
async function injectPages(config: webpack.Configuration): Promise<webpack.Configuration> {
  let pageFiles = await Glob(Path.join(SrcDir, "**/page*.tsx"));

  let pageEntries = pageFiles.reduce((entries, _f)=> {
    let f = _f.toString();
    entries[Path.basename(f, ".tsx")] = f;  // page1: '/path/to/page1.tsx'
    return entries;
  }, {});
  let pagePlugins = pageFiles.map((_f)=>{
    let f = _f.toString();
    let htmlf = f.slice(SrcDir.length+1).replace(/\.tsx$/i, ".html"); // where to place html in dist output
    
    let pluginCfg: any = {
      chunks: [Path.basename(f, ".tsx")],
      filename: htmlf
    }

    // if customized page template exists: name match in src/assets/, then use it, otherwise use fefault
    let htmlTemplate = Path.join(SrcDir, 'assets', htmlf);
    if (Fs.pathExistsSync(htmlTemplate)) { pluginCfg.template = htmlTemplate}
    else { pluginCfg.template = DefaultHtmlTemplate}

    return new HtmlWebpackPlugin(pluginCfg);
  });
  return cfgMerge({}, config, {
    entry: pageEntries,
    plugins: pagePlugins
  });
}

const createConfigForTarget = (config: webpack.Configuration, target: Target): webpack.Configuration => {
  let newConfig;
  if (/^dev/.test(target)) {
    newConfig = cfgMerge({}, config, {
      mode: "development",
      output: {path: Path.join(DistDir, target)},
      devtool: 'eval-source-map',
      plugins: [
      ]
    });
  } else if (/^release/.test(target)) {
    newConfig = cfgMerge({}, config, {
      mode: "production",
      output: {path: Path.join(DistDir, target)},
      devtool: 'nosources-source-map',
      plugins: [
        new UglifyJsPlugin({
          sourceMap: true,
          uglifyOptions: {}
        })]
    });
  } else {
    throw new Error(`Unknow build target ${target}`);
  }
  if (!/-full$/.test(target)) {
    cfgMerge(newConfig, {
      plugins: [
        cdnPlugin
      ]  
    })
  }
  return newConfig;
}

async function main(env, arg): Promise<webpack.Configuration[]> {
  let targets = ['dev'];
  let buildtarget = _.find(_.flatten([env]), (e) => /^build=/.test(e));
  if (buildtarget) {
    targets = /^build=(.+)$/.exec(buildtarget)[1].split(',');
  }
  console.log("Building for targets " + targets);

  // inject entries and html for page*.tsx
  let config = await injectPages(BaseConfig);

  // clean dist dir
  for (let t of targets) {
    await Fs.emptyDir(Path.join(DistDir, t));
  }

  // make configs
  return targets.map((t: Target) => createConfigForTarget(config, t));
}

module.exports = main;