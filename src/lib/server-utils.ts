import 'server-only';

import path from 'node:path';

export const getStorageLocation = (): string =>
  process.env.NEXT_PUBLIC_STORAGE_PREFIX ?? path.join(process.cwd(), 'data');

export const tracksDir = path.join(getStorageLocation(), 'tracks');
export const coversDir = path.join(getStorageLocation(), 'covers');
