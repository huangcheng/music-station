import { from, of, lastValueFrom } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import type { NextRequest } from 'next/server';

import type { CreatePlaylistRequest } from '@/types';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const ob$ = from<Promise<CreatePlaylistRequest>>(req.json()).pipe(
    switchMap(({ name }) =>
      from(
        prisma.playlist.create({
          data: {
            name,
            internal: false,
          },
        }),
      ),
    ),
    map((data) => NextResponse.json({ message: 'ok', data })),
    catchError((err) =>
      of(NextResponse.json({ message: err.message }, { status: 500 })),
    ),
  );

  return lastValueFrom(ob$);
}
