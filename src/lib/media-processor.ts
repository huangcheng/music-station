import fs from 'node:fs/promises';
import path from 'node:path';

import { forkJoin, of, iif, from, defer, Observable } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { PrismaClient } from '@prisma/client';
import { parseBuffer } from 'music-metadata';

import { coversDir } from '@/lib/server';

const prisma = new PrismaClient();

export function processMediaFile(
  filePath: string,
  hash: string,
  buffer?: Buffer,
): Observable<boolean> {
  const readBuffer$ = buffer ? of(buffer) : from(fs.readFile(filePath));

  return readBuffer$.pipe(
    switchMap((buf) =>
      from(parseBuffer(buf)).pipe(
        map((meta) => {
          const { common, format } = meta;
          const {
            codec,
            lossless,
            numberOfChannels,
            bitsPerSample,
            sampleRate,
            duration,
            bitrate,
          } = format;

          const name = common.title ?? path.parse(filePath).name;
          const artist = common.artist ?? 'Unknown Artist';
          const genre = common.genre ?? [];
          const album = common.album ?? 'Unknown Album';
          const picture = common.picture?.[0];
          const disk = common.disk?.no ?? 1;
          const trackNo = common.track?.no ?? 0;
          const trackCount = common.track?.of ?? 1;
          const year = common.year;
          const date = common.date;

          return {
            hash,
            name,
            artist,
            album,
            genre,
            picture,
            year,
            date,
            disk,
            trackNo,
            trackCount,
            codec,
            lossless,
            numberOfChannels,
            bitsPerSample,
            sampleRate,
            duration,
            bitrate,
            size: buf.length,
          };
        }),
        switchMap(
          ({
            hash,
            name,
            artist,
            album,
            genre,
            picture,
            year,
            date,
            disk,
            trackNo,
            trackCount,
            ...rest
          }) => {
            return iif(
              () => picture !== undefined,
              defer(() => {
                const ext = picture!.format.split('/').pop() || 'jpg';
                const coverName = `${path.parse(filePath).name}.${ext}`;
                const coverPath = path.join(coversDir, coverName);

                return from(fs.writeFile(coverPath, picture!.data)).pipe(
                  map(() => coverName),
                );
              }),
              of(null),
            ).pipe(
              switchMap((cover) =>
                forkJoin({
                  artist: from(
                    prisma.artist.upsert({
                      where: { name: artist },
                      update: {},
                      create: { name: artist },
                    }),
                  ),
                  genre:
                    genre.length > 0
                      ? forkJoin(
                          genre.map((name) =>
                            from(
                              prisma.genre.upsert({
                                where: { name },
                                update: {},
                                create: { name },
                              }),
                            ),
                          ),
                        )
                      : of([]),
                  album: from(
                    prisma.album.upsert({
                      where: { name: album },
                      update: {},
                      create: {
                        name: album,
                        year,
                        date,
                        trackCount,
                      },
                    }),
                  ),
                }).pipe(
                  switchMap(({ artist, genre, album }) =>
                    from(
                      prisma.track.upsert({
                        where: { hash },
                        update: {
                          name,
                          cover,
                          disk,
                          trackNo,
                          year,
                          date,
                          albumId: album.id,
                          artistId: artist.id,
                          file: path.basename(filePath),
                          ...rest,
                        },
                        create: {
                          hash,
                          name,
                          cover,
                          disk,
                          year,
                          date,
                          trackNo,
                          albumId: album.id,
                          artistId: artist.id,
                          file: path.basename(filePath),
                          ...rest,
                        },
                      }),
                    ).pipe(
                      switchMap((record) =>
                        forkJoin([
                          ...(genre.length > 0
                            ? [
                                forkJoin(
                                  genre.map((g) =>
                                    from(
                                      prisma.trackGenre.create({
                                        data: {
                                          genre: {
                                            connect: { id: g.id },
                                          },
                                          track: {
                                            connect: { id: record.id },
                                          },
                                        },
                                      }),
                                    ).pipe(catchError(() => of(null))),
                                  ),
                                ),
                              ]
                            : []),
                          from(
                            prisma.album.update({
                              where: { id: album.id },
                              data: {
                                artistId: artist.id,
                              },
                            }),
                          ),
                        ]),
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
        map(() => true),
        catchError(() => of(false)),
      ),
    ),
  );
}
