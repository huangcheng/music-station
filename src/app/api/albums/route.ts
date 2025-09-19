import { from, of, lastValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { omit } from 'es-toolkit';

const prisma = new PrismaClient();

export async function GET() {
  const ob$ = from(
    prisma.album.findMany({
      include: {
        music: true,
        artist: true,
      },
      orderBy: { name: 'asc' },
    }),
  ).pipe(
    map((albums) =>
      albums.map(({ music, ...rest }) => ({
        ...rest,
        music: music.map((m) => omit(m, ['hash', 'albumId', 'artistId'])),
      })),
    ),
    map((albums) => albums.filter((album) => album.music.length > 0)),
    map((data) => NextResponse.json({ data })),
    catchError((err) =>
      of(NextResponse.json({ message: err.message }, { status: 500 })),
    ),
  );

  return await lastValueFrom(ob$);
}
