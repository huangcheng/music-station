FROM node:latest

LABEL maintainer="HUANG Cheng<cheng@duck.com>"

WORKDIR /app

COPY . .

VOLUME /data

RUN echo "NEXT_PUBLIC_STORAGE_PREFIX=\"/data\"" > .env
RUN echo "DATABASE_URL=\"file:/data/library.db\"" >> .env
RUN echo "NEXT_PUBLIC_BCRYPT_SALT_ROUNDS=12" >> .env
RUN echo "SESSION_SECRET=\"$(openssl rand -base64 32)\"" >> .env

RUN echo "registry=https://registry.npmmirror.com/" > .npmrc

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile

RUN pnpm prisma

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]
