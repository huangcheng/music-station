import { NextResponse } from 'next/server';
import { forkJoin, from, of, lastValueFrom } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

export async function GET() {
  const ob$ = from(
    client.music.findMany({
      include: {
        artist: true,
        album: true,
      },
    }),
  ).pipe(
    switchMap((music) =>
      forkJoin(
        music.map((m) =>
          from(
            client.musicGenre.findMany({
              where: { musicId: m.id },
              include: { genre: true },
            }),
          ).pipe(
            map((genre) => ({
              ...m,
              genre,
            })),
          ),
        ),
      ),
    ),
    map((music) => NextResponse.json({ data: music })),
    catchError((err) =>
      of(NextResponse.json({ error: String(err) }), { status: 500 }),
    ),
  );

  return await lastValueFrom(ob$);
}
