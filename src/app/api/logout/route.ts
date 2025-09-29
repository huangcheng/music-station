import { NextResponse } from 'next/server';
import { from, lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

import { deleteSession } from '@/lib/session';

export async function POST() {
  const ob$ = from(deleteSession()).pipe(
    map((result) =>
      result
        ? NextResponse.json({ message: 'Logged out successfully' })
        : NextResponse.json({ message: 'No active session' }, { status: 400 }),
    ),
  );

  return await lastValueFrom(ob$);
}
