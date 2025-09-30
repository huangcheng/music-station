import { defer, forkJoin, from, iif, lastValueFrom, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import type { NextRequest } from 'next/server';
import type { Observable } from 'rxjs';
import type Prisma from '@prisma/client';

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
        map((record) => {
          const { tracks: existingTracks = [] } = record ?? {};
          const existingTrackIds = existingTracks
            .map(({ trackId }) => trackId)
            .sort((a, b) => a - b);

          const newTrackIds = (tracks ?? []).sort((a, b) => a - b);

          // Find items to be created (in newTrackIds but not in existingTrackIds)
          const itemsToBeCreated = newTrackIds.filter(
            (id) => !existingTrackIds.includes(id),
          );

          // Find items to be deleted (in existingTrackIds but not in newTrackIds)
          const itemsToBeDeleted = existingTrackIds.filter(
            (id) => !newTrackIds.includes(id),
          );

          return { record, itemsToBeCreated, itemsToBeDeleted };
        }),
        switchMap(({ record, itemsToBeCreated, itemsToBeDeleted }) =>
          iif(
            () =>
              record !== null &&
              (itemsToBeCreated.length > 0 || itemsToBeDeleted.length > 0),
            defer(() =>
              forkJoin(
                [
                  itemsToBeCreated.length > 0
                    ? from(
                        prisma.playlistTrack.createMany({
                          data: itemsToBeCreated.map((trackId) => ({
                            playlistId: id,
                            trackId,
                          })),
                        }),
                      )
                    : null,
                  itemsToBeDeleted.length > 0
                    ? from(
                        prisma.playlistTrack.deleteMany({
                          where: {
                            playlistId: id,
                            trackId: { in: itemsToBeDeleted },
                          },
                        }),
                      )
                    : null,
                ].filter(Boolean) as Observable<Prisma.Prisma.BatchPayload>[],
              ).pipe(map(() => record)),
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
