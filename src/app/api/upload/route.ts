import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import { NextResponse } from 'next/server';
import {
  forkJoin,
  of,
  iif,
  from,
  lastValueFrom,
  defer,
  Observable,
} from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { PrismaClient } from '@prisma/client';
import { parseBuffer } from 'music-metadata';
import pino from 'pino';

import type { NextRequest } from 'next/server';

import { isMusicFile, musicExtend } from '@/lib';

type SavedFile = {
  buffer?: Buffer;
  field: string;
  originalName?: string;
  fileName: string;
  size: number;
  url: string;
  hash: string;
};

const prisma = new PrismaClient();

const logger = pino({ name: 'upload-route' });

const getStorageLocation = (): string =>
  process.env.NEXT_PUBLIC_STORAGE_PREFIX ?? path.join(process.cwd(), 'data');

const storage = getStorageLocation();

const musics = path.join(storage, 'musics');
const covers = path.join(storage, 'covers');

async function ensureUploadDir() {
  await fs.mkdir(musics, { recursive: true });
  await fs.mkdir(covers, { recursive: true });
}

export async function POST(req: Request) {
  const ob$ = from(ensureUploadDir()).pipe(
    switchMap(() => from(req.formData())),
    map((form) => [...form.entries()]),
    switchMap((entries) =>
      forkJoin(
        entries
          .map(([field, value]) => {
            if (typeof (value as File).arrayBuffer !== 'function') {
              return of(null);
            }

            const file = value as File;

            return from(file.arrayBuffer()).pipe(
              map((arrayBuffer) => Buffer.from(arrayBuffer)),
              switchMap((buffer) => {
                // const safeName = `${Date.now()}_${path.basename(file.name)}`;
                const fileName = path.basename(file.name);
                const filePath = path.join(musics, fileName);
                const size = file.size;

                const hash = crypto
                  .createHash('sha256')
                  .update(buffer)
                  .digest('hex');

                return from(fs.writeFile(filePath, buffer)).pipe(
                  map(() => ({
                    field,
                    buffer,
                    // originalName: file.name,
                    hash,
                    fileName,
                    size,
                    url: `/uploads/${fileName}`,
                  })),
                );
              }),
            );
          })
          .filter(Boolean) as Observable<SavedFile>[],
      ),
    ),
    switchMap((files) =>
      forkJoin(
        files.map((file) => {
          const { buffer, hash, size } = file;

          return from(parseBuffer(buffer!)).pipe(
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

              const name = common.title ?? path.parse(file.fileName).name;
              // const artists = common.artists ?? common.artist?.split(',') ?? [];
              const artist = common.artist ?? 'Unknown Artist';
              const genre = common.genre ?? [];
              const album = common.album ?? 'Unknown Album';
              const picture = common.picture?.[0];
              const disk = common.disk?.no ?? 1;
              const track = common.track?.no ?? 0;
              const tracks = common.track?.of ?? 1;
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
                track,
                tracks,
                codec,
                lossless,
                numberOfChannels,
                bitsPerSample,
                sampleRate,
                duration,
                bitrate,
                size,
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
                track,
                tracks,
                ...rest
              }) => {
                return iif(
                  () => picture !== undefined,
                  defer(() => {
                    const ext = picture!.format.split('/').pop() || 'jpg';
                    const coverName = `${path.parse(file.fileName).name}.${ext}`;
                    const cover = path.join(covers, coverName);

                    return from(fs.writeFile(cover, picture!.data)).pipe(
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
                          create: { name: album, year, date, tracks },
                        }),
                      ),
                    }).pipe(
                      switchMap(({ artist, genre, album }) =>
                        from(
                          prisma.music.upsert({
                            where: { hash },
                            update: {
                              name,
                              cover,
                              disk,
                              track,
                              year,
                              date,
                              albumId: album.id,
                              artistId: artist.id,
                              file: file.fileName,
                              ...rest,
                            },
                            create: {
                              hash,
                              name,
                              cover,
                              disk,
                              year,
                              date,
                              track,
                              albumId: album.id,
                              artistId: artist.id,
                              file: file.fileName,
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
                                          prisma.musicGenre.create({
                                            data: {
                                              genre: {
                                                connect: { id: g.id },
                                              },
                                              music: {
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
            map(() => file),
            map(() => {
              delete file.buffer;

              return file;
            }),
          );
        }),
      ),
    ),
    map((files) => NextResponse.json({ success: true, files })),
    catchError((error) => {
      console.error(error.message ?? error);

      return of(
        NextResponse.json(
          { success: false, error: String(error) },
          { status: 500 },
        ),
      );
    }),
  );

  return await lastValueFrom(ob$);
}

export async function GET(request: NextRequest) {
  const ob$ = of(null).pipe(
    map(() => {
      const { searchParams } = new URL(request.url);

      return searchParams.get('file');
    }),
    switchMap((file) =>
      iif(
        () => file !== null,
        defer(() => {
          const isMusic = isMusicFile(file!);

          const dir = isMusic ? musics : covers;

          const filePath = path.join(dir, path.basename(file!));

          return from(fs.readFile(filePath)).pipe(
            switchMap((buffer) =>
              from(fs.stat(filePath)).pipe(
                map((stat) => ({
                  buffer,
                  stat,
                })),
              ),
            ),
            map(
              ({ buffer, stat }) =>
                new NextResponse(buffer as BodyInit, {
                  status: 200,
                  headers: {
                    'Content-Type': isMusic
                      ? musicExtend(file!).mimeType
                      : `image/${path.extname(filePath).slice(1)}`,
                    'Content-Length': stat.size.toString(),
                    'Cache-Control': 'public, max-age=31536000, immutable',
                  },
                }),
            ),
            catchError((error) => {
              logger.error('Read file error:', error.message || error);

              return of(
                NextResponse.json({ msg: 'File not found' }, { status: 404 }),
              );
            }),
          );
        }),
        of(NextResponse.json({ msg: 'No file specified' }, { status: 400 })),
      ),
    ),
  );

  return await lastValueFrom(ob$);
}
