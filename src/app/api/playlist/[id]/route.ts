import { defer, forkJoin, from, iif, lastValueFrom, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import type { NextRequest } from 'next/server';

import type { CreatePlayListRequest } from '@/types';

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<'/api/playlist/[id]'>,
) {
  const ob$ = forkJoin({
    id: from(ctx.params).pipe(map(({ id }) => Number(id))),
    body: from(req.json() as Promise<CreatePlayListRequest>),
  }).pipe(
    switchMap(({ id, body: { name, music } }) =>
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
                prisma.playlistMusic.findMany({
                  where: { playlistId: id },
                }),
              ).pipe(
                map((records) => {
                  const musicList = records.map(({ musicId }) => musicId);

                  return {
                    add: music.filter((m) => !musicList.includes(m)),
                    remove: musicList.filter((m) => !music.includes(m)),
                  };
                }),
                switchMap(({ add, remove }) =>
                  forkJoin([
                    ...add.map((musicId) =>
                      from(
                        prisma.playlistMusic.create({
                          data: {
                            playlistId: id,
                            musicId,
                          },
                        }),
                      ),
                    ),
                    ...remove.map((musicId) =>
                      from(
                        prisma.playlistMusic.deleteMany({
                          where: {
                            playlistId: id,
                            musicId,
                          },
                        }),
                      ),
                    ),
                    from(
                      prisma.playlist.update({
                        where: { id },
                        data: { name },
                      }),
                    ),
                  ]),
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
