import { defer, forkJoin, from, iif, of, lastValueFrom } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { omit } from 'es-toolkit';

import type { NextRequest } from 'next/server';

import type { UpdateMusicRequest } from '@/types';

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<'/api/music/[id]'>,
) {
  const ob$ = forkJoin({
    id: from(ctx.params).pipe(map(({ id }) => Number(id))),
    body: from<Promise<UpdateMusicRequest>>(req.json()),
  }).pipe(
    switchMap(({ id, body }) =>
      from(
        prisma.music.update({
          where: { id },
          data: omit(body, ['genre']),
        }),
      ).pipe(
        switchMap((record) =>
          iif(
            () => (body.genre ?? []).length > 0,
            defer(() =>
              from(prisma.musicGenre.deleteMany({ where: { musicId: id } })),
            ).pipe(
              switchMap(() =>
                forkJoin(
                  (body.genre ?? []).map((genre) =>
                    from(
                      prisma.musicGenre.create({
                        data: { musicId: id, genreId: genre },
                      }),
                    ),
                  ),
                ),
              ),
              map(() => record),
            ),
            of(record),
          ),
        ),
      ),
    ),
    map((record) => NextResponse.json({ data: record })),
    catchError((err) =>
      of(NextResponse.json({ message: err.message }, { status: 500 })),
    ),
  );

  return lastValueFrom(ob$);
}
