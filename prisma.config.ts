import path from 'node:path';
import dotenv from 'dotenv';

const __dir = path.dirname(new URL(import.meta.url).pathname);

import type { PrismaConfig } from 'prisma';

dotenv.config();

export default {
  schema: path.join(__dir, 'prisma'),
  migrations: {
    seed: 'tsx ./prisma/seed.ts',
  },
} satisfies PrismaConfig;
