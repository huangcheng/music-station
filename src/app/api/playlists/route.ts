import { from, of, lastValueFrom, forkJoin, iif, defer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { omit } from 'es-toolkit';

import type { Playlist, Response, Track } from '@/types';

const prisma = new PrismaClient();

export async function GET() {
  const ob$ = from(
    prisma.playlist.findMany({
      orderBy: { name: 'asc' },
    }),
  ).pipe(
    switchMap((playlists) =>
      iif(
        () => playlists.length > 0,
        defer(() =>
          forkJoin(
            playlists.map((playlist) =>
              from(
                prisma.playlistTrack.findMany({
                  where: { playlistId: playlist.id },
                  include: {
                    track: true,
                  },
                }),
              ).pipe(
                map(
                  (records) =>
                    records.map(({ track }) => track) as unknown as Track[],
                ),
                map((tracks) => ({
                  ...playlist,
                  tracks: tracks.map((track) => ({
                    ...omit(track, ['hash', 'albumId', 'artistId']),
                    file: `/api/upload?file=${encodeURIComponent(track.file)}`,
                    cover: track.cover
                      ? `/api/upload?file=${encodeURIComponent(track.cover)}`
                      : undefined,
                  })) as unknown as Track[],
                })),
              ),
            ),
          ),
        ),
        of([]),
      ),
    ),
    map((data: Playlist[]) =>
      NextResponse.json({ data } as Response<Playlist[]>),
    ),
    catchError((err) => {
      console.error('Error fetching playlists:', err);

      return of(NextResponse.json({ message: err.message }, { status: 500 }));
    }),
  );

  return await lastValueFrom(ob$);
}
