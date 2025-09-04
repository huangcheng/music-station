import { from, of, lastValueFrom, forkJoin, iif, defer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import type { Playlist, Response } from '@/types';

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
                prisma.playlistMusic.findMany({
                  where: { playlistId: playlist.id },
                }),
              ).pipe(
                map((records) => ({
                  ...playlist,
                  music: (records ?? []).map((record) => record.musicId),
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
