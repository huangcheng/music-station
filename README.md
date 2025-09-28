# Music Station
![Logo](./public/images/icon.png)

A self-hosted music streaming server built with Next.js, Prisma, and SQLite. It allows you to manage and stream your music collection from anywhere.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Environment Variables
You will need to set up the following environment variables in a `.env.local` file at the root of your project:

```bash
# The location of your storage directory, tracks and database will be stored here.
NEXT_PUBLIC_STORAGE_PREFIX="/data"

# The URL of your database. For SQLite, you can use the following format:
DATABASE_URL="file:./dev.db"

# A secret string for session management. Make sure to use a strong, unique value.
# This can be generated using a tool like `openssl rand -base64 32`
SESSION_SECRET="your_session_secret_here"
```