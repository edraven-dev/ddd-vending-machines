// Shared tsdown (Rolldown + Oxc) config for the NestJS apps: one ESM bundle per app, with the workspace libs inlined.
import { existsSync, readFileSync } from 'node:fs';
import { createRequire, isBuiltin } from 'node:module';
import { dirname, isAbsolute, join } from 'node:path';
import { defineConfig } from 'tsdown';

const WORKSPACE_SCOPE = '@vending-machines/';

interface Manifest {
  name: string;
  dependencies?: Record<string, string>;
}

const packageNameOf = (id: string) => {
  const [first, second] = id.split('/');
  return first.startsWith('@') ? `${first}/${second}` : first;
};

const manifestByDir = new Map<string, Manifest | null>();
/** The package.json that owns a source file, i.e. the closest one above it. */
const owningManifest = (file: string): Manifest | null => {
  const visited: string[] = [];
  let dir = dirname(file);
  while (!manifestByDir.has(dir)) {
    visited.push(dir);
    const candidate = join(dir, 'package.json');
    if (existsSync(candidate)) {
      manifestByDir.set(dir, JSON.parse(readFileSync(candidate, 'utf8')));
    } else if (dirname(dir) === dir) {
      manifestByDir.set(dir, null);
    } else {
      dir = dirname(dir);
    }
  }
  const manifest = manifestByDir.get(dir) ?? null;
  visited.forEach((visitedDir) => manifestByDir.set(visitedDir, manifest));
  return manifest;
};

export interface NestAppOptions {
  /** .proto files to copy from @vending-machines/proto (relative to its src/lib) into dist/assets */
  protos?: string[];
}

export const nestApp = ({ protos = [] }: NestAppOptions = {}) =>
  defineConfig((cli) => {
    const manifestPath = join(process.cwd(), 'package.json');
    const app: Manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const dev = Boolean(cli.watch);
    // Read at runtime (Swagger, MikroORM debug); inherited by the process started by onSuccess.
    if (dev) process.env.NODE_ENV ??= 'development';
    const protoDir = protos.length
      ? join(dirname(createRequire(manifestPath).resolve(`${WORKSPACE_SCOPE}proto/package.json`)), 'src/lib')
      : '';

    return {
      entry: ['src/main.ts'],
      platform: 'node',
      format: 'esm',
      target: 'es2023',
      sourcemap: true,
      dts: false,
      // Every bare import stays a runtime import, except the workspace libs (TypeScript source packages) and
      // Oxc's decorator helpers, which are bundled.
      deps: { neverBundle: true, alwaysBundle: [/^@vending-machines\//, /^@oxc-project\/runtime\//] },
      // Explicit, so Nest DI and MikroORM metadata never depend on which tsconfig gets resolved (e.g. in Docker).
      inputOptions: (options) => ({
        ...options,
        transform: { ...options.transform, decorator: { legacy: true, emitDecoratorMetadata: true } },
      }),
      // One file. Keep class names: scope hoisting would rename colliding classes, and class names are event
      // routing keys, stored aggregate types and MikroORM entity names.
      outputOptions: { codeSplitting: false, keepNames: true },
      plugins: [
        {
          name: 'vending-machines:declared-dependencies',
          resolveId: {
            order: 'pre',
            filter: { id: /^[^./\0]/ },
            handler(source, importer) {
              if (!importer || isAbsolute(source) || isBuiltin(source) || source.startsWith('@oxc-project/runtime/')) {
                return null;
              }
              const pkg = packageNameOf(source);
              const owner = owningManifest(importer);
              // Keeps the Turbo graph correct...
              if (owner && !owner.dependencies?.[pkg]) {
                this.error(`${owner.name} imports "${pkg}", which is missing from its package.json dependencies`);
              }
              // ...and the Docker image complete: `pnpm deploy` installs only the app's own dependencies.
              if (!pkg.startsWith(WORKSPACE_SCOPE) && !app.dependencies?.[pkg]) {
                this.error(
                  `${app.name} bundles an import of "${pkg}" (from ${owner?.name}); add it to its dependencies`,
                );
              }
              return null;
            },
          },
        },
      ],
      copy: protos.map((proto) => ({ from: join(protoDir, proto), to: join('dist/assets', dirname(proto)) })),
      onSuccess: dev ? 'node --enable-source-maps --env-file-if-exists=.env dist/main.mjs' : undefined,
    };
  });
