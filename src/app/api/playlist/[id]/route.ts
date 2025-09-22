import { defer, forkJoin, from, iif, lastValueFrom, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import type { NextRequest } from 'next/server';

import type { CreatePlaylistRequest } from '@/types';

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<'/api/playlist/[id]'>,
) {
  const ob$ = forkJoin({
    id: from(ctx.params).pipe(map(({ id }) => Number(id))),
    body: from<Promise<CreatePlaylistRequest>>(
      req.json() as Promise<CreatePlaylistRequest>,
    ),
  }).pipe(
    switchMap(({ id, body: { name, tracks } }) =>
      from(
        prisma.playlist.findFirst({
          where: { id },
        }),
      ).pipe(
        switchMap((record) =>
          iif(
            () => record !== null,
            defer(() =>
              from(
                prisma.playlistTrack.deleteMany({
                  where: { playlistId: id },
                }),
              ).pipe(
                switchMap(() =>
                  forkJoin(
                    tracks.map((trackId) =>
                      from(
                        prisma.playlistTrack.create({
                          data: {
                            playlistId: id,
                            trackId,
                          },
                        }),
                      ),
                    ),
                  ),
                ),
                switchMap(() =>
                  from(
                    prisma.playlist.update({
                      where: { id },
                      data: { name },
                    }),
                  ),
                ),
                map(() => true),
              ),
            ),
            of(false),
          ),
        ),
      ),
    ),
    map((succeeded) =>
      succeeded
        ? NextResponse.json({ message: 'Playlist updated' })
        : NextResponse.json({ message: 'Unexpected error' }, { status: 500 }),
    ),
    catchError((error) => {
      console.error(error);

      return of(NextResponse.json({ message: error.message }, { status: 500 }));
    }),
  );

  return await lastValueFrom(ob$);
}
