import { forkJoin, from, of, lastValueFrom } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import type { NextRequest } from 'next/server';

import type { CreatePlayListRequest } from '@/types';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const ob$ = from<Promise<CreatePlayListRequest>>(req.json()).pipe(
    switchMap(({ name, music }) =>
      from(
        prisma.playlist.create({
          data: {
            name,
          },
        }),
      ).pipe(
        switchMap((playlist) =>
          forkJoin(
            music.map((id) =>
              from(
                prisma.playlistMusic.create({
                  data: {
                    playlistId: playlist.id,
                    musicId: id,
                  },
                }),
              ).pipe(
                catchError((error) => {
                  console.error(error);

                  return of(null);
                }),
              ),
            ),
          ).pipe(
            switchMap(() =>
              from(
                prisma.playlistMusic.findMany({
                  where: { playlistId: playlist.id },
                }),
              ),
            ),
            map((records) => records.map(({ musicId }) => musicId)),
            map((music) => ({
              ...playlist,
              music,
            })),
          ),
        ),
      ),
    ),
    map((data) => NextResponse.json({ data })),
    catchError((err) =>
      of(NextResponse.json({ message: err.message }, { status: 500 })),
    ),
  );

  return lastValueFrom(ob$);
}
