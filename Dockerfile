# syntax=docker/dockerfile:1.4

FROM node:22-alpine AS builder

LABEL maintainer="HUANG Cheng<cheng@duck.com>"

WORKDIR /app

# Install pnpm and app dependencies with cache mount
COPY package.json pnpm-lock.yaml ./
RUN apk add --no-cache openssl
RUN npm install -g pnpm
RUN npm install -g tsx
RUN npm install -g husky
RUN --mount=type=cache,id=pnpm-store,target=/root/.cache/pnpm pnpm install --frozen-lockfile

# Prepare data dir
RUN mkdir -p /data

# Copy source, generate Prisma client and run migrations/seeding
COPY . .
RUN echo "NEXT_PUBLIC_STORAGE_PREFIX=\"/data\"" > .env \
 && echo "DATABASE_URL=\"file:/data/library.db\"" >> .env \
 && echo "NEXT_PUBLIC_BCRYPT_SALT_ROUNDS=12" >> .env \
 && echo "SESSION_SECRET=\"$(openssl rand -base64 32)\"" >> .env
RUN npx prisma generate
RUN npx prisma migrate deploy
RUN tsx ./prisma/seed.ts

# Build and prune dev dependencies so only production modules remain
RUN pnpm run build
RUN pnpm prune --prod

# ----------------------
# Production image
# ----------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Install pnpm & openssl
RUN npm install -g pnpm

# Copy only production artifacts and modules from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /data /data

# Mount data volume
VOLUME /data

EXPOSE 3000
CMD ["pnpm", "start"]
