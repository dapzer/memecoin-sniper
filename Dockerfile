FROM node:20.12 as appbuild

WORKDIR /app
COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN pnpm run database:generate
RUN pnpm run build

FROM appbuild as app

WORKDIR /app
COPY package*.json ./

RUN npm install -g pnpm

COPY --from=appbuild /app/node_modules ./node_modules
COPY --from=appbuild /app/dist ./dist

CMD ["pnpm", "start"]
