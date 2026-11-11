# VendingMachines

A pnpm workspace orchestrated by [Turborepo](https://turborepo.com):

- `apps/atm`, `apps/management`, `apps/snack-machine`, `apps/event-store`: NestJS services, bundled with webpack
- `apps/frontend`: SvelteKit app
- `libs/events`, `libs/proto`, `libs/shared`: TypeScript source packages (`@vending-machines/*`) that the apps bundle

## Setup

Use the Node.js version from `.nvmrc` and the pnpm version from `packageManager` in `package.json`, then run:

```sh
pnpm install
docker compose up -d   # Postgres, Redis, RabbitMQ
```

Each service reads its settings from `apps/<app>/.env` (see `.env.example`).

## Common tasks

```sh
pnpm dev --filter atm         # run one app in watch mode
pnpm dev                      # run every app
pnpm build                    # build everything (Turborepo caches unchanged packages)
pnpm lint
pnpm typecheck
pnpm test
pnpm turbo run test --filter=atm   # any task for one package
```

`--filter=...@vending-machines/shared` selects a lib and every package that depends on it, and `--affected` limits a run to packages changed on the current branch.

## Database migrations

Each NestJS app has its own MikroORM migrations:

```sh
pnpm --filter atm migration:generate <Name>   # create a migration from entity changes
pnpm --filter atm migration:up
pnpm --filter atm migration:check
```

The apps also apply pending migrations on startup.

## CI and Docker

CircleCI generates its pipeline from `turbo run <task> --affected` (`.circleci/generate-config.sh`), so only changed packages are built, linted and tested. Docker images are built per app with `docker build --build-arg APP=<app> .`, which uses `turbo prune` and `pnpm deploy` so each image contains only that app's production dependencies.
