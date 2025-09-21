import { defer, forkJoin, from, iif, of, lastValueFrom } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { omit } from 'es-toolkit';

import type { NextRequest } from 'next/server';

import type { UpdateTrackRequest } from '@/types';

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<'/api/track/[id]'>,
) {
  const ob$ = forkJoin({
    id: from(ctx.params).pipe(map(({ id }) => Number(id))),
    body: from<Promise<UpdateTrackRequest>>(req.json()),
  }).pipe(
    switchMap(({ id, body }) =>
      from(
        prisma.track.update({
          where: { id },
          data: omit(body, ['genre']),
        }),
      ).pipe(
        switchMap((record) =>
          iif(
            () => (body.genre ?? []).length > 0,
            defer(() =>
              from(prisma.trackGenre.deleteMany({ where: { trackId: id } })),
            ).pipe(
              switchMap(() =>
                forkJoin(
                  (body.genre ?? []).map((genre) =>
                    from(
                      prisma.trackGenre.create({
                        data: { trackId: id, genreId: genre },
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
