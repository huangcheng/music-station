import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import { NextResponse } from 'next/server';
import { forkJoin, of, defer, iif, from, lastValueFrom } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { PrismaClient } from '@prisma/client';

import type { NextRequest } from 'next/server';
import type { Observable } from 'rxjs';

import { processMediaFile, tracksDir } from '@/lib/server';

const prisma = new PrismaClient();

type ScanResult = {
  file: string;
  success: boolean;
  status: 'added' | 'removed' | 'skipped';
};

type TaskResult = ScanResult[];

function scan(): Observable<ScanResult[]> {
  const results: ScanResult[] = [];

  return from(fs.readdir(tracksDir)).pipe(
    switchMap((files) =>
      forkJoin(
        files.map((file) => {
          const filePath = path.join(tracksDir, file);
          return from(fs.readFile(filePath)).pipe(
            switchMap((buffer) => {
              const hash = crypto
                .createHash('sha256')
                .update(buffer)
                .digest('hex');

              return from(prisma.track.findUnique({ where: { hash } })).pipe(
                switchMap((existing) =>
                  iif(
                    () => existing !== null,
                    defer(() => {
                      results.push({
                        file,
                        success: true,
                        status: 'skipped',
                      });

                      return of(true);
                    }),
                    defer(() =>
                      processMediaFile(filePath, hash, buffer).pipe(
                        map((success) => {
                          results.push({
                            file,
                            success,
                            status: 'added',
                          });
                          return success;
                        }),
                      ),
                    ),
                  ),
                ),
              );
            }),
            catchError(() => {
              results.push({ file, success: false, status: 'skipped' });

              return of(false);
            }),
          );
        }),
      ),
    ),
    switchMap(() => from(prisma.track.findMany())),
    switchMap((tracks) =>
      forkJoin(
        tracks.map((track) => {
          const filePath = path.join(tracksDir, track.file);
          return from(fs.access(filePath)).pipe(
            map(() => true),
            catchError(() => of(false)),
            switchMap((exists) =>
              iif(
                () => !exists,
                from(
                  prisma.trackGenre.deleteMany({
                    where: { trackId: track.id },
                  }),
                ).pipe(
                  switchMap(() =>
                    from(
                      prisma.playlistTrack.deleteMany({
                        where: { trackId: track.id },
                      }),
                    ),
                  ),
                  switchMap(() =>
                    from(prisma.track.delete({ where: { id: track.id } })),
                  ),
                  map(() => {
                    results.push({
                      file: track.file,
                      success: true,
                      status: 'removed',
                    });
                    return true;
                  }),
                ),
                of(true),
              ),
            ),
          );
        }),
      ),
    ),
    map(() => results),
    catchError(() => of([])),
  );
}

const tasks: Record<string, () => Observable<TaskResult>> = {
  scan,
};

export async function POST(
  _: NextRequest,
  ctx: RouteContext<'/api/task/[name]'>,
): Promise<Response> {
  const ob$: Observable<Response> = from<Promise<{ name: string }>>(
    ctx.params,
  ).pipe(
    map(({ name }) => name),
    switchMap((task) =>
      iif(
        () => task in tasks,
        defer(() => tasks[task]()).pipe(
          map((result) => NextResponse.json({ success: true, result })),
        ),
        of(
          NextResponse.json(
            { success: false, message: 'Task not found' },
            { status: 404 },
          ),
        ),
      ),
    ),
    catchError((error) =>
      of(
        NextResponse.json(
          { success: false, error: String(error) },
          { status: 500 },
        ),
      ),
    ),
  );

  return await lastValueFrom(ob$);
}
