import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

import type { NextRequest } from 'next/server';

import { decrypt, deleteSession } from './lib/session';

const prisma = new PrismaClient();

const protectedRoutes = new Set(['/', '/dashboard']);
const publicRoutes = new Set(['/login', '/api/login']);

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.has(path);
  const isPublicRoute = publicRoutes.has(path);

  // eslint-disable-next-line unicorn/no-await-expression-member
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session?.id) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  const { id, expires } = session ?? {};

  const record = prisma.session.findUnique({
    where: { id },
  });

  if (record === null || dayjs(expires).isBefore(dayjs())) {
    await deleteSession();

    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isPublicRoute && !/\//.test(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/login|_next/static|_next/image|.*\.png$).*)'],
};
