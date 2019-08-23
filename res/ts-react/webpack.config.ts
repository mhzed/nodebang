// tslint:disable-next-line: file-header

import * as DynamicCdnWebpackPlugin from 'dynamic-cdn-webpack-plugin';
import * as Glob from 'fast-glob';
import * as Fs from 'fs-extra';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as _ from 'lodash';
import * as moduleToCdn from 'module-to-cdn';
import * as Path from 'path';
import * as webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { WebpackWhyPlugin } from 'webpack-why-plugin';
/**
 * Examples:
 *    webpack -env build=dev
 *    webpack -env build=dev,release
 *
 * dev: development build, bundle all src in original format, using cdn
 * release: production build, output js is uglified and src removed from sourcemap, using cdd
 * *-full: same as above but without using cdn
*/
type Target = 'dev' | 'release' | 'dev-full' | 'release-full';

const SrcDir = Path.join(__dirname, './src');
const DistDir = Path.join(__dirname, './dist');
const DefaultHtmlTemplate = Path.join(SrcDir, 'assets', 'index.html');

// the common base configuration
const BaseConfig: webpack.Configuration = {
  entry: {
  },
  output: {
    filename: '[name].js'
  },
  //devtool,
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader' },
      { enforce: 'pre', test: /\.js$/, use: 'source-map-loader' },
      { test: /\.(s*)css$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
      },
      { test: /\.(ttf|eot|svg|png|jp(e*)g)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=2000' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: DefaultHtmlTemplate,
      chunks: ['index']
    })
  ]
  //externals,
};

////////// CDN plugin
interface CdnModule { name: string; var: string; url: string; version: string; }
const CdnPlugin = new DynamicCdnWebpackPlugin({
  resolver: (moduleName: string, version: string, options: { env: 'development' | 'production' }): CdnModule => {
    let m: CdnModule = moduleToCdn(moduleName, version, options);
    if (m === null) {
      // add own cdn overrides.  However it's recommended to update module 'module-to-cdn' instead.
    }
    return m;
  }
});

////////// config merge helper
const cfgMerge = (target, ...src) => {
  return _.mergeWith(target, ...src, (dst, src) => {
    if (_.isArray(dst)) {
      return dst.concat(src);
    } else { return undefined; }
  });
};

// recursively scan for all index.tsx files in src/ dir, set as entries and also generate a html file for each.
// Example:
// src/admin/index.tsx   =>  dist/[target]/admin/index.html,  dist/[target]/admin.js
// src/admin/stats/index.tsx   =>  dist/[target]/admin/stats/index.html,  dist/[target]/stats.js
async function injectPages(config: webpack.Configuration): Promise<webpack.Configuration> {
  const pageChunks = (await Glob(Path.join(SrcDir, '**/index.tsx'))).reduce((entries, _f) => {
    const f = _f.toString();
    const name = (Path.dirname(f).toLowerCase() === SrcDir.toLowerCase()) ? 'index' : Path.basename(Path.dirname(f));
    entries.push([name, f]);
    return entries;
  }, []);

  let pageEntries = pageChunks.reduce((entries, [chunk, file]) => {
    entries[chunk] = file;
    return entries;
  }, {});

  let pagePlugins = pageChunks.map(([chunk, file]) => {
    let htmlf = file.slice(SrcDir.length + 1).replace(/\.tsx$/i, '.html'); // where to place html in dist output
    let pluginCfg: any = {
      chunks: [chunk],
      filename: htmlf
    };
    // if customized page template exists: name match in src/assets/, then use it, otherwise use fefault
    let htmlTemplate = Path.join(SrcDir, 'assets', htmlf);
    if (Fs.pathExistsSync(htmlTemplate)) { pluginCfg.template = htmlTemplate; } else { pluginCfg.template = DefaultHtmlTemplate; }

    return new HtmlWebpackPlugin(pluginCfg);
  });
  return cfgMerge({}, config, {
    entry: pageEntries,
    plugins: pagePlugins
  });
}

////////  Per build target configuration
const createConfigForTarget = (config: webpack.Configuration, target: Target): webpack.Configuration => {
  let newConfig;
  if (/^dev/.test(target)) {
    newConfig = cfgMerge({}, config, {
      mode: 'development',
      output: { path: Path.join(DistDir, target) },
      devtool: 'eval-source-map',
      plugins: [
      ]
    });
  } else if (/^release/.test(target)) {
    newConfig = cfgMerge({}, config, {
      mode: 'production',
      output: { path: Path.join(DistDir, target) },
      devtool: 'nosources-source-map',
      plugins: [
      ]
    });
  } else {
    throw new Error(`Unknow build target ${target}`);
  }
  if (!/-full$/.test(target)) {
    cfgMerge(newConfig, {
      plugins: [
        CdnPlugin
      ]
    });
  }
  return newConfig;
};

///////// The main method
async function main(env, arg): Promise<webpack.Configuration[]> {
  let targets = ['dev'];    // default target 'dev'
  let buildtarget = _.find(_.flatten([env]), e => /^build=/.test(e));
  if (buildtarget) {
    targets = /^build=(.+)$/.exec(buildtarget)[1].split(',');
  }
  console.log('Building for targets ' + targets.join(','));

  // inject configuration for multipe page entries
  let config = await injectPages(BaseConfig);
  if (arg.analyze) {
    config.plugins.push(new BundleAnalyzerPlugin());
  }
  if (arg.why) {
    config.plugins.push(new WebpackWhyPlugin({ names: arg.why }));
  }

  // clean dist target dir
  for (let t of targets) {
    await Fs.emptyDir(Path.join(DistDir, t));
  }

  // make configs
  return targets.map((t: Target) => createConfigForTarget(config, t));
}

module.exports = main;
