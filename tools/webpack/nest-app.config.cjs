// Shared webpack config for the NestJS apps (replaces Nx's @nx/webpack + withNx).
const fs = require('node:fs');
const path = require('node:path');
const { isBuiltin } = require('node:module');
const CopyPlugin = require('copy-webpack-plugin');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const { swcDefaultsFactory } = require('@nestjs/cli/lib/compiler/defaults/swc-defaults');

const WORKSPACE_SCOPE = '@vending-machines/';

const packageNameOf = (request) => {
  const [first, second] = request.split('/');
  return first.startsWith('@') ? `${first}/${second}` : first;
};

const manifestByDir = new Map();
/** The package.json that owns a source file, i.e. the closest one above it. */
const owningManifest = (file) => {
  const visited = [];
  let dir = path.dirname(file);
  while (!manifestByDir.has(dir)) {
    visited.push(dir);
    const candidate = path.join(dir, 'package.json');
    if (fs.existsSync(candidate)) {
      manifestByDir.set(dir, JSON.parse(fs.readFileSync(candidate, 'utf8')));
    } else if (path.dirname(dir) === dir) {
      manifestByDir.set(dir, null);
    } else {
      dir = path.dirname(dir);
    }
  }
  visited.forEach((visitedDir) => manifestByDir.set(visitedDir, manifestByDir.get(dir)));
  return manifestByDir.get(dir);
};

/**
 * @param {object} options
 * @param {string} options.dirname the app directory (pass `__dirname`)
 * @param {string[]} [options.protos] .proto files to copy from @vending-machines/proto, relative to its src/lib
 * @param {string} [options.swcTarget] swc `jsc.target`
 */
module.exports =
  ({ dirname, protos = [], swcTarget = 'es2022' }) =>
  (_env, argv) => {
    const isDev = argv.mode === 'development';
    // Read at runtime (e.g. to enable Swagger); inherited by the app that RunScriptWebpackPlugin starts.
    if (isDev) process.env.NODE_ENV ??= 'development';

    const { swcOptions } = swcDefaultsFactory();
    swcOptions.jsc.target = swcTarget;
    swcOptions.jsc.externalHelpers = false;

    const protoDir =
      protos.length &&
      path.join(path.dirname(require.resolve(`${WORKSPACE_SCOPE}proto/package.json`, { paths: [dirname] })), 'src/lib');

    return {
      context: dirname,
      target: 'node',
      mode: isDev ? 'development' : 'production',
      entry: './src/main.ts',
      devtool: 'source-map',
      output: { path: path.join(dirname, 'dist'), filename: 'main.js', clean: true },
      resolve: { extensions: ['.ts', '.js'] },
      // Keep Node's real __dirname so `join(__dirname, 'assets/...')` points into dist/.
      node: { __dirname: false, __filename: false },
      // No minification (MikroORM and Nest rely on class names); NODE_ENV is read at runtime, not inlined.
      optimization: { minimize: false, nodeEnv: false },
      module: {
        rules: [{ test: /\.ts$/, exclude: /node_modules/, use: { loader: 'swc-loader', options: swcOptions } }],
      },
      externals: [
        ({ request, contextInfo }, callback) => {
          if (!request || request.startsWith('.') || path.isAbsolute(request) || request.includes('!')) {
            return callback();
          }
          if (isBuiltin(request)) {
            return callback(null, `commonjs ${request}`);
          }
          // Every import must be declared by the package it is written in, so the Turbo graph and
          // `pnpm deploy` (which installs the app's production dependencies) stay correct.
          const pkg = packageNameOf(request);
          const owner = contextInfo?.issuer && owningManifest(contextInfo.issuer);
          if (owner && !owner.dependencies?.[pkg]) {
            return callback(new Error(`${owner.name} imports "${pkg}", which is missing from its package.json dependencies`));
          }
          // Workspace libs are TypeScript source packages, so bundle them; everything else is required at runtime.
          return pkg.startsWith(WORKSPACE_SCOPE) ? callback() : callback(null, `commonjs ${request}`);
        },
      ],
      plugins: [
        protoDir &&
          new CopyPlugin({
            patterns: protos.map((proto) => ({ from: path.join(protoDir, proto), to: path.join('assets', proto) })),
          }),
        isDev && new RunScriptWebpackPlugin({ name: 'main.js', autoRestart: true, nodeArgs: ['--env-file-if-exists=.env'] }),
      ].filter(Boolean),
      stats: 'errors-warnings',
    };
  };
