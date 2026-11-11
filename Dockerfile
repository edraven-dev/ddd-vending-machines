# Exact version comes from .nvmrc (CI passes --build-arg NODE_VERSION); "lts" is only a local fallback
ARG NODE_VERSION=lts

FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Corepack isn't bundled with Node.js 25+, so install the pnpm version pinned in package.json
COPY package.json /tmp/package.json
RUN npm install -g "$(node -p "require('/tmp/package.json').packageManager")" && rm /tmp/package.json

# ✂️ Prune the monorepo down to the app and the workspace packages it depends on
FROM base AS pruner
ARG APP
COPY . .
RUN pnpm dlx "turbo@$(node -p "require('./package.json').devDependencies.turbo")" prune "${APP}" --docker

# 🏡 Install, build, and collect the app's production dependencies
FROM base AS builder
ARG APP
RUN apk add --no-cache python3 make gcc g++
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
COPY tools/ tools/
RUN pnpm turbo run build --filter="${APP}"
RUN pnpm --filter="${APP}" --prod deploy /prod/app

# 🚀 Production Server
FROM node:${NODE_VERSION}-alpine AS prod
ARG APP
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production

COPY --chown=node:node --from=builder /prod/app/node_modules node_modules
COPY --chown=node:node --from=builder /app/apps/${APP}/dist dist

USER node

CMD ["node", "dist/main.js"]
