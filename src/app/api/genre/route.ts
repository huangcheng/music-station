import { from, of, lastValueFrom, forkJoin, iif, defer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { omit } from 'es-toolkit';

import type { Genre, Response, Track } from '@/types';

const prisma = new PrismaClient();

export async function GET() {
  const ob$ = from(
    prisma.genre.findMany({
      orderBy: { name: 'asc' },
    }),
  ).pipe(
    switchMap((genre) =>
      iif(
        () => genre.length > 0,
        defer(() =>
          forkJoin(
            genre.map((g) =>
              from(
                prisma.trackGenre.findMany({
                  where: { genreId: g.id },
                  include: {
                    track: true,
                  },
                }),
              ).pipe(
                map((records) => records.map(({ track }) => track)),
                map((tracks) => ({
                  ...g,
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
    map((data: Genre[]) => NextResponse.json({ data } as Response<Genre[]>)),
    catchError((err) => {
      console.error('Error fetching genre:', err);

      return of(NextResponse.json({ message: err.message }, { status: 500 }));
    }),
  );

  return await lastValueFrom(ob$);
}
