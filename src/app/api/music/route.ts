import { NextResponse } from 'next/server';
import { forkJoin, from, iif, of, defer, lastValueFrom } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { PrismaClient } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { omit } from 'es-toolkit';

const prisma = new PrismaClient();

export async function GET() {
  const ob$ = from(
    prisma.music.findMany({
      include: {
        artist: true,
        album: true,
      },
    }),
  ).pipe(
    switchMap((music) =>
      iif(
        () => music.length > 0,
        defer(() =>
          forkJoin(
            music.map((m) =>
              from(
                prisma.musicGenre.findMany({
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
          ).pipe(
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

                return omit(record, ['hash', 'artistId', 'albumId']);
              }),
            ),
          ),
        ),
        of([]),
      ),
    ),
    map((tracks) =>
      tracks.map(({ file, cover, ...rest }) => ({
        ...rest,
        file: `/api/upload?file=${encodeURIComponent(file)}`,
        cover: cover
          ? `/api/upload?file=${encodeURIComponent(cover)}`
          : undefined,
      })),
    ),
    map((music) => NextResponse.json({ data: music })),
    catchError(() => of(NextResponse.json({ data: [] }))),
  );

  return await lastValueFrom(ob$);
}
