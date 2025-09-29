import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { defer, from, iif, lastValueFrom, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { omit } from 'es-toolkit';
import { PrismaClient } from '@prisma/client';

import { decrypt } from '@/lib/session';

const prisma = new PrismaClient();

export async function GET() {
  const ob$ = from(cookies()).pipe(
    map((cookieStore) => cookieStore.get('session')?.value),
    switchMap((session) =>
      iif(
        () => (session ?? '').length > 0,
        defer(() =>
          from(decrypt(session)).pipe(
            switchMap((payload) =>
              iif(
                () => payload?.id !== undefined,
                defer(() =>
                  from(
                    prisma.session.findUnique({
                      where: { id: payload!.id },
                      include: { user: true },
                    }),
                  ).pipe(
                    catchError((err) => {
                      console.error('Error fetching session:', err);

                      return of(null);
                    }),
                  ),
                ),
                of(null),
              ),
            ),
          ),
        ),
        of(null),
      ),
    ),
    catchError((err) => {
      console.error('Error fetching user:', err);

      return of(null);
    }),
    map((record) =>
      record === null
        ? NextResponse.json({ message: 'No active session' }, { status: 401 })
        : NextResponse.json({
            message: 'ok',
            data: omit(record.user, ['password', 'createdAt', 'updatedAt']),
          }),
    ),
  );

  return await lastValueFrom(ob$);
}
