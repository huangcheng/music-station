import fs from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';
import { forkJoin, of, from, lastValueFrom } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import pino from 'pino';

import type { Observable } from 'rxjs';

type SavedFile = {
  field: string;
  originalName?: string;
  fileName: string;
  size: number;
  url: string;
};

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const logger = pino({ name: 'upload-route' });

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
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
              return null;
            }

            const file = value as File;

            return from(file.arrayBuffer()).pipe(
              map((arrayBuffer) => Buffer.from(arrayBuffer)),
              switchMap((buffer) => {
                // const safeName = `${Date.now()}_${path.basename(file.name)}`;
                const fileName = path.basename(file.name);
                const filePath = path.join(UPLOAD_DIR, fileName);

                return from(fs.writeFile(filePath, buffer)).pipe(
                  map(() => ({
                    field,
                    // originalName: file.name,
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
    map((files) => NextResponse.json({ success: true, files })),
    catchError((error) => {
      logger.error('Upload error:', error);

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
    const files = await fs.readdir(UPLOAD_DIR);
    const list = await Promise.all(
      files.map(async (fileName) => {
        const stats = await fs.stat(path.join(UPLOAD_DIR, fileName));
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
