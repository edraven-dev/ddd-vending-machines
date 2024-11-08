ARG NODE_IMAGE=node:22.11.0-alpine

# 🧑‍💻 Development
FROM ${NODE_IMAGE} AS dev
RUN apk add --no-cache libc6-compat python3 make gcc g++
WORKDIR /app

ENV NODE_ENV=development

COPY --chown=node:node . .

RUN  npm ci

# 🏡 Production Build
FROM ${NODE_IMAGE} AS build

ARG NX_PROJECT_NAME

WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make gcc g++

ENV NODE_ENV=production

COPY --chown=node:node --from=dev /app/node_modules ./node_modules
COPY --chown=node:node . .

RUN npm run build ${NX_PROJECT_NAME}
RUN npm pkg delete scripts.prepare
RUN npm ci --omit=dev
RUN npm cache clean --force
RUN npx -y clean-modules -y

USER node

# 🚀 Production Server
FROM ${NODE_IMAGE} AS prod

ARG NX_PROJECT_NAME

WORKDIR /app
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production

COPY --chown=node:node --from=build /app/dist/apps/${NX_PROJECT_NAME} dist
COPY --chown=node:node --from=build /app/node_modules node_modules

USER node

CMD ["node", "dist/main.js"]