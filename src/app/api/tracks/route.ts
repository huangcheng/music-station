import { NextResponse } from 'next/server';
import { forkJoin, from, iif, of, defer, lastValueFrom } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { PrismaClient } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { omit } from 'es-toolkit';

const prisma = new PrismaClient();

export async function GET() {
  const ob$ = from(
    prisma.track.findMany({
      include: {
        artist: true,
        album: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ).pipe(
    switchMap((tracks) =>
      iif(
        () => tracks.length > 0,
        defer(() =>
          forkJoin(
            tracks.map((track) =>
              from(
                prisma.trackGenre.findMany({
                  where: { trackId: track.id },
                  include: { genre: true },
                  orderBy: { createdAt: 'asc' },
                }),
              ).pipe(
                map((genre) => ({
                  ...track,
                  genre,
                })),
              ),
            ),
          ).pipe(
            switchMap((tracks) =>
              from(getTranslations()).pipe(
                map((t) => ({
                  tracks,
                  t,
                })),
              ),
            ),
            map(({ tracks, t }) =>
              tracks.map((track) => {
                const record = {
                  ...track,
                  genre: track.genre.map((g) => g.genre.name),
                  artist: track.artist?.name ?? t('Unknown Artist'),
                  album: track.album?.name ?? t('Unknown Album'),
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
