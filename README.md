# VendingMachines

A pnpm workspace orchestrated by [Turborepo](https://turborepo.com). Everything is ESM:

- `apps/atm`, `apps/management`, `apps/snack-machine`, `apps/event-store`: NestJS 12 services, each bundled by [tsdown](https://tsdown.dev) (Rolldown + Oxc) into a single `dist/main.mjs`
- `apps/frontend`: SvelteKit 3 static app
- `libs/events`, `libs/proto`, `libs/shared`: TypeScript source packages (`@vending-machines/*`) that the apps bundle

Relative imports don't use `.js` suffixes: tsdown and Vitest resolve them, and TypeScript uses `moduleResolution: "bundler"`.

## Setup

Use the Node.js version from `.nvmrc` and the pnpm version from `packageManager` in `package.json`, then run:

```sh
pnpm install
docker compose up -d   # Postgres, Redis, RabbitMQ
```

Each service reads its settings from `apps/<app>/.env` (see `.env.example`).

Shared dependency versions live in the `catalog` of `pnpm-workspace.yaml`; packages reference them as `"catalog:"`, so bump a version there to update every app at once.

## Common tasks

```sh
pnpm dev --filter atm              # run one app: rebuild on change and restart it
pnpm dev                           # run every app
pnpm build                         # build everything (Turborepo caches unchanged packages)
pnpm lint                          # oxlint, type-aware
pnpm typecheck                     # tsc (svelte-check for the frontend)
pnpm test                          # Vitest
pnpm format                        # oxfmt (pnpm format:check in CI)
pnpm turbo run test --filter=atm   # any task for one package
```

`--filter=...@vending-machines/shared` selects a lib and every package that depends on it, and `--affected` limits a run to packages changed on the current branch. Pre-commit runs `oxlint --fix` and `oxfmt` on staged files.

## Database migrations

Each NestJS app has its own MikroORM migrations. The CLI reads the app's `.env` itself and loads TypeScript through `@oxc-node/core`:

```sh
pnpm --filter atm migration:generate <Name>   # create a migration from entity changes
pnpm --filter atm migration:create <Name>     # create an empty migration (refused while entity changes have no migration)
pnpm --filter atm migration:check             # fail if an entity change has no migration (also runs in CI)
pnpm --filter atm migration:up
```

`migration:generate` and `migration:check` compare the entities with the schema snapshot committed next to the migrations (`src/database/migrations/.snapshot-<db>.json`), not with your local database, so they need no database. Commit the snapshot together with each migration. If it conflicts during a rebase, take the target branch's snapshot, delete your migration and generate it again.

The apps also apply pending migrations on startup.

## CI and Docker

CircleCI generates its pipeline from `turbo run <task> --affected` (`.circleci/generate-config.sh`), comparing `develop` and `master` against their last deployed commit (the newest `release-dev-*` or `release-*` tag, which the pipeline pushes after a successful deploy) and other branches against their merge-base with `develop`, so only changed packages are built, linted and tested. A deploy updates the k8s manifests only for the images it rebuilt. Docker images are built per app with `docker build --build-arg APP=<app> .`, which uses `turbo prune` and `pnpm deploy` so each image contains only that app's production dependencies.

## Upgrade note: BullMQ 6

The management app schedules its prune job with BullMQ 6 job schedulers. BullMQ 6 refuses to start on Redis data left by BullMQ 5 repeatable jobs, so before deploying, delete that queue's keys while management is stopped:

```sh
redis-cli --scan --pattern 'bull:prune-head-offices-queue:*' | xargs -r redis-cli del
```

Locally, `docker compose exec redis redis-cli FLUSHALL` does the same.
