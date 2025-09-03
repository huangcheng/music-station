import { NextResponse } from 'next/server';
import { forkJoin, from, of, lastValueFrom } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { PrismaClient } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { omit } from 'es-toolkit';

const client = new PrismaClient();

export async function GET() {
  'use server';

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
    switchMap((music) =>
      from(getTranslations('Music')).pipe(
        map((t) => ({
          music,
          t,
        })),
      ),
    ),
    map(({ music, t }) =>
      music.map((m) => {
        const record = {
          ...m,
          genre: m.genre.map((g) => g.genre.name),
          artist: m.artist?.name ?? t('Unknown Artist'),
          album: m.album?.name ?? t('Unknown Album'),
        };

        return omit(record, ['id', 'hash', 'artistId', 'albumId']);
      }),
    ),
    map((music) => NextResponse.json({ data: music })),
    catchError(() => of(NextResponse.json({ data: [] }))),
  );

  return await lastValueFrom(ob$);
}
