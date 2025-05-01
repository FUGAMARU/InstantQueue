FROM node:22-alpine as base
WORKDIR /usr/src/app

FROM base as deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

FROM deps as build
COPY . .
RUN npm run build

FROM base as final
USER node
COPY package.json .
COPY package-lock.json .
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/server ./server
EXPOSE 3000
CMD [ "node", "server/entry.express"]
