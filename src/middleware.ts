import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dayjs from 'dayjs';

import type { NextRequest } from 'next/server';

import { decrypt } from './lib/session';

const protectedRoutes = new Set(['/', '/dashboard']);
const publicRoutes = new Set(['/login', '/api/login']);

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.has(path);
  const isPublicRoute = publicRoutes.has(path);

  // eslint-disable-next-line unicorn/no-await-expression-member
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  const { id, expires } = session ?? {};

  if (
    isProtectedRoute &&
    (!id || !expires || dayjs().isAfter(dayjs(expires)))
  ) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isPublicRoute && id) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/login|_next/static|_next/image|.*\.png$).*)'],
};
