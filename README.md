This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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
# The location of your storage directory, musics and database will be stored here.
NEXT_PUBLIC_STORAGE_PREFIX=your_storage_prefix_here # e.g., "/data"

# The URL of your database. For SQLite, you can use the following format:
DATABASE_URL="file:./dev.db"
```