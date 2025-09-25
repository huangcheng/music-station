import { defer, forkJoin, from, iif, lastValueFrom, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isEqual } from 'es-toolkit';

import type { NextRequest } from 'next/server';

import type { CreatePlaylistRequest } from '@/types';

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<'/api/playlist/[id]'>,
) {
  const ob$ = forkJoin({
    id: from(ctx.params).pipe(map(({ id }) => Number(id))),
    body: from<Promise<CreatePlaylistRequest>>(req.json()),
  }).pipe(
    switchMap(({ id, body: { name, tracks } }) =>
      from(
        prisma.playlist.findFirst({
          where: { id },
          include: { tracks: true },
        }),
      ).pipe(
        switchMap((record) =>
          iif(
            () =>
              record !== null &&
              tracks !== undefined &&
              !isEqual(
                [...tracks].sort(),
                record.tracks.map(({ trackId }) => trackId).sort(),
              ),
            defer(() =>
              from(
                prisma.playlistTrack.deleteMany({ where: { playlistId: id } }),
              ).pipe(
                switchMap(() =>
                  forkJoin(
                    tracks!.map((trackId) =>
                      from(
                        prisma.playlistTrack.create({
                          data: { playlistId: id, trackId },
                        }),
                      ),
                    ),
                  ),
                ),
                map(() => record),
                catchError((error) => {
                  console.error(error);

                  return of(record);
                }),
              ),
            ),
            of(record),
          ),
        ),
        switchMap((record) =>
          iif(
            () => record !== null,
            defer(() =>
              from(
                prisma.playlist.update({ where: { id }, data: { name } }),
              ).pipe(map(() => true)),
            ),
            of(false),
          ),
        ),
      ),
    ),
    map((succeeded) =>
      succeeded
        ? NextResponse.json({ message: 'Playlist updated' })
        : NextResponse.json({ message: 'Playlist not found' }, { status: 404 }),
    ),
    catchError((error) => {
      console.error(error);

      return of(NextResponse.json({ message: error.message }, { status: 500 }));
    }),
  );
  return await lastValueFrom(ob$);
}

export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<'/api/playlist/[id]'>,
) {
  const ob$ = from(ctx.params).pipe(
    map(({ id }) => Number(id)),
    switchMap((id) =>
      from(
        prisma.playlist.findFirst({
          where: { id, internal: false },
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
                  from(prisma.playlist.delete({ where: { id } })),
                ),
                map(() => true),
              ),
            ),
            of(false),
          ),
        ),
        map((succeeded) =>
          succeeded
            ? NextResponse.json({ message: 'Playlist deleted' })
            : NextResponse.json(
                { message: 'Playlist not found or is internal' },
                { status: 404 },
              ),
        ),
      ),
    ),
    catchError((error) => {
      console.error(error);

      return of(NextResponse.json({ message: error.message }, { status: 500 }));
    }),
  );

  return await lastValueFrom(ob$);
}
