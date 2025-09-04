import { from, of, lastValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { omit } from 'es-toolkit';

const prisma = new PrismaClient();

export async function GET() {
  const ob$ = from(
    prisma.artist.findMany({
      include: {
        music: true,
        albums: true,
      },
      orderBy: { name: 'asc' },
    }),
  ).pipe(
    map((artist) =>
      artist.map(({ music, albums, ...rest }) => ({
        ...rest,
        music: music.map((m) => omit(m, ['hash', 'albumId', 'albumId'])),
        albums: albums.map((album) => omit(album, ['artistId'])),
      })),
    ),
    map((music) => music.filter((m) => m.music.length > 0)),
    map((data) => NextResponse.json({ data })),
    catchError((err) =>
      of(NextResponse.json({ message: err.message }, { status: 500 })),
    ),
  );

  return await lastValueFrom(ob$);
}
