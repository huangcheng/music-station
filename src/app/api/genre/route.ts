import { from, of, lastValueFrom, forkJoin, iif, defer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import type { Genre, Response } from '@/types';

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
                }),
              ).pipe(
                map((records) => ({
                  ...g,
                  tracks: (records ?? []).map(({ trackId }) => trackId),
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
