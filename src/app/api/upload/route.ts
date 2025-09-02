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

import { getStorageLocation } from '@/lib';

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
                    size: buffer.length,
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
          const { buffer, hash } = file;

          return from(parseBuffer(buffer!)).pipe(
            map((meta) => {
              const { common } = meta;

              const title = common.title ?? path.parse(file.fileName).name;
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
                title,
                artist,
                album,
                genre,
                picture,
                year,
                date,
                disk,
                track,
                tracks,
              };
            }),
            switchMap(
              ({
                hash,
                title,
                artist,
                album,
                genre,
                picture,
                year,
                date,
                disk,
                track,
                tracks,
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
                      genre: forkJoin(
                        genre.map((name) =>
                          from(
                            prisma.genre.upsert({
                              where: { name },
                              update: {},
                              create: { name },
                            }),
                          ),
                        ),
                      ),
                      album: from(
                        prisma.album.upsert({
                          where: { title: album },
                          update: {},
                          create: { title: album, year, date, tracks },
                        }),
                      ),
                    }).pipe(
                      switchMap(({ artist, genre, album }) =>
                        from(
                          prisma.music.upsert({
                            where: { hash },
                            update: {
                              title,
                              cover,
                              disk,
                              track,
                              year,
                              date,
                              albumId: album.id,
                              artistId: artist.id,
                            },
                            create: {
                              hash,
                              title,
                              cover,
                              disk,
                              year,
                              date,
                              track,
                              albumId: album.id,
                              artistId: artist.id,
                            },
                          }),
                        ).pipe(
                          switchMap((record) =>
                            forkJoin([
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
                                  ),
                                ),
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
      logger.error('Upload error:', error.message || error);

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

export async function GET() {
  try {
    await ensureUploadDir();
    const files = await fs.readdir(musics);
    const list = await Promise.all(
      files.map(async (fileName) => {
        const stats = await fs.stat(path.join(musics, fileName));
        return {
          fileName,
          size: stats.size,
          url: `/uploads/${fileName}`,
          createdAt: stats.birthtime,
        };
      }),
    );

    return NextResponse.json({ success: true, files: list });
  } catch (error) {
    console.error('List upload error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
