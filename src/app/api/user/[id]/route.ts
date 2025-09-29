import { NextResponse } from 'next/server';
import { from, lastValueFrom } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { PrismaClient } from '@prisma/client';

import type { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  ctx: RouteContext<'/api/user/[id]'>,
) {
  const ob$ = from(ctx.params).pipe(
    map(({ id }) => Number(id)),
    switchMap((id) =>
      from(
        prisma.user.findUnique({
          where: { id },
          omit: { password: true },
        }),
      ),
    ),
    map((record) =>
      record === null
        ? NextResponse.json({ message: 'User not found' }, { status: 404 })
        : NextResponse.json({ message: 'ok', data: record }),
    ),
  );

  return await lastValueFrom(ob$);
}
