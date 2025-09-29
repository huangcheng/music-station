import 'server-only';
import { cookies } from 'next/headers';
import { defer, from, iif, lastValueFrom, of } from 'rxjs';
import { tap, switchMap, map, catchError } from 'rxjs/operators';
import { SignJWT, jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

import type { SessionPayload } from '@/types';

export const prisma = new PrismaClient();

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined = '',
): Promise<SessionPayload | undefined> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });

    return payload as unknown as SessionPayload;
  } catch {
    console.log('Failed to verify session');
  }
}

/**
 * Create a session cookie for the user
 * @param userId
 * @param remember - if true, session lasts 30 days; otherwise, 7 days
 */
export async function createSession(userId: number, remember: boolean = false) {
  const ob$ = of(
    new Date(Date.now() + (remember ? 30 : 1) * 24 * 60 * 60 * 1000),
  ).pipe(
    switchMap((expires) =>
      from(
        prisma.session.create({
          data: {
            userId,
            expires,
          },
        }),
      ).pipe(
        switchMap(({ id }) =>
          from(encrypt({ id, expires: expires.toISOString() })),
        ),
        switchMap((session) =>
          from(cookies()).pipe(
            tap((cookieStore) => {
              cookieStore.set('session', session, {
                httpOnly: true,
                secure: true,
                expires,
                sameSite: 'lax',
              });
            }),
          ),
        ),
        map(() => true),
        catchError((err) => {
          console.error('Error creating session:', err);
          return of(false);
        }),
      ),
    ),
  );

  return await lastValueFrom(ob$);
}

export async function deleteSession() {
  const ob$ = from(cookies()).pipe(
    map((cookieStore) => ({
      cookieStore,
      session: cookieStore.get('session'),
    })),
    switchMap(({ session, cookieStore }) =>
      iif(
        () => (session?.value ?? '').length > 0,
        defer(() =>
          from(decrypt(session?.value)).pipe(
            switchMap((payload) =>
              from(
                prisma.session.deleteMany({
                  where: { id: payload?.id },
                }),
              ),
            ),
            tap(() => {
              cookieStore.delete('session');
            }),
            map(() => true),
            catchError((err) => {
              console.error('Error deleting session:', err);

              return of(false);
            }),
          ),
        ),
        of(false),
      ),
    ),
  );

  return await lastValueFrom(ob$);
}
