import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import { NextResponse } from 'next/server';
import { forkJoin, of, iif, from, lastValueFrom, defer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { PrismaClient } from '@prisma/client';
import pino from 'pino';

import type { NextRequest } from 'next/server';

import { isMusicFile, musicExtend } from '@/lib';
import { processMediaFile, tracksDir, coversDir } from '@/lib/server';

type FileResult = {
  field: string;
  fileName: string;
  hash: string;
  url: string;
  status: 'skipped' | 'processed' | 'failed';
};

const prisma = new PrismaClient();

const logger = pino({ name: 'upload-route' });

async function ensureUploadDir() {
  await fs.mkdir(tracksDir, { recursive: true });
  await fs.mkdir(coversDir, { recursive: true });
}

export async function POST(req: Request) {
  const ob$ = from(ensureUploadDir()).pipe(
    switchMap(() => from(req.formData())),
    map((form) => [...form.entries()]),
    switchMap((entries) =>
      forkJoin(
        entries
          .filter(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_, value]) => typeof (value as File).arrayBuffer === 'function',
          )
          .map(([field, value]) => {
            const file = value as File;
            return from(file.arrayBuffer()).pipe(
              map((arrayBuffer) => Buffer.from(arrayBuffer)),
              switchMap((buffer) => {
                const hash = crypto
                  .createHash('sha256')
                  .update(buffer)
                  .digest('hex');
                const fileName = path.basename(file.name);
                const filePath = path.join(tracksDir, fileName);
                return from(prisma.track.findUnique({ where: { hash } })).pipe(
                  switchMap((existing) =>
                    iif(
                      () => existing !== null,
                      of({
                        field,
                        fileName,
                        hash,
                        url: `/uploads/${fileName}`,
                        status: 'skipped' as const,
                      }),
                      from(fs.writeFile(filePath, buffer)).pipe(
                        switchMap(() =>
                          processMediaFile(filePath, hash, buffer),
                        ),
                        map(
                          (success) =>
                            ({
                              field,
                              fileName,
                              hash,
                              url: `/uploads/${fileName}`,
                              status: success ? 'processed' : 'failed',
                            }) as const,
                        ),
                      ),
                    ),
                  ),
                );
              }),
            );
          }),
      ),
    ),
    map((results: FileResult[]) =>
      NextResponse.json({ success: true, files: results }),
    ),
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

          const dir = isMusic ? tracksDir : coversDir;

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
                    ETag: `"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`,
                    'Content-Type': isMusic
                      ? musicExtend(file!).mimeType
                      : `image/${path.extname(filePath).slice(1)}`,
                    'Content-Length': stat.size.toString(),
                    'Last-Modified': stat.mtime.toUTCString(),
                    'Accept-Ranges': 'bytes',
                    // 'Content-Disposition': `inline; filename="${path.basename(file!)}"`,
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
