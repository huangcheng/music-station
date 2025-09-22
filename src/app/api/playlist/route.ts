import { forkJoin, from, of, lastValueFrom } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import type { NextRequest } from 'next/server';

import type { CreatePlaylistRequest } from '@/types';
import { omit } from 'es-toolkit';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const ob$ = from<Promise<CreatePlaylistRequest>>(req.json()).pipe(
    switchMap(({ name, tracks }) =>
      from(
        prisma.playlist.create({
          data: {
            name,
            internal: false,
          },
        }),
      ).pipe(
        switchMap((playlist) =>
          forkJoin(
            tracks.map((id) =>
              from(
                prisma.playlistTrack.create({
                  data: {
                    playlistId: playlist.id,
                    trackId: id,
                  },
                }),
              ).pipe(
                catchError((error) => {
                  console.error(error);

                  return of(null);
                }),
              ),
            ),
          ).pipe(
            switchMap(() =>
              from(
                prisma.playlistTrack.findMany({
                  where: { playlistId: playlist.id },
                  include: { track: true },
                }),
              ),
            ),
            // map((records) => records.map(({ trackId }) => trackId)),
            map((records) => records.map(({ track }) => track)),
            map((tracks) => ({
              ...playlist,
              tracks: tracks.map((track) => ({
                ...omit(track, ['hash', 'albumId', 'artistId']),
                file: `/api/upload?file=${encodeURIComponent(track.file)}`,
                cover: track.cover
                  ? `/api/upload?file=${encodeURIComponent(track.cover)}`
                  : undefined,
              })),
            })),
          ),
        ),
      ),
    ),
    map((data) => NextResponse.json({ data })),
    catchError((err) =>
      of(NextResponse.json({ message: err.message }, { status: 500 })),
    ),
  );

  return lastValueFrom(ob$);
}
