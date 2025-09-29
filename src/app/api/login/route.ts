import { NextResponse } from 'next/server';
import { defer, from, of, iif, lastValueFrom } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { omit } from 'es-toolkit';

import type { NextRequest } from 'next/server';

import type { LoginRequest } from '@/types';

import { createSession } from '@/lib/session';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const ob$ = from<Promise<LoginRequest>>(req.json()).pipe(
    switchMap(({ email, password, remember }) =>
      from(
        prisma.user.findUnique({
          where: { email },
        }),
      ).pipe(
        map((record) => ({ record, remember })),
        switchMap(({ record, remember }) =>
          from(compare(password, record?.password || '')).pipe(
            map((matched) => (matched ? record : null)),
            map((record) => ({ record, remember })),
          ),
        ),
      ),
    ),
    switchMap(({ record, remember }) =>
      iif(
        () => record !== null,
        defer(() =>
          from(createSession(record!.id, remember)).pipe(
            map((result) => (result ? omit(record!, ['password']) : null)),
          ),
        ),
        of(null),
      ),
    ),
    map((record) =>
      record === null
        ? NextResponse.json(
            { message: 'Invalid email or password' },
            { status: 401 },
          )
        : NextResponse.json({ message: 'ok' }),
    ),
  );

  return lastValueFrom(ob$);
}
