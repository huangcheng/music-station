import { defer, forkJoin, from, iif, lastValueFrom, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { hash } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

import type { Observable } from 'rxjs';

const prisma = new PrismaClient();

const saltRounds = Number(process.env.NEXT_PUBLIC_BCRYPT_SALT_ROUNDS ?? 12);

const seedPlaylist = (): Observable<boolean> =>
  from(prisma.playlist.findMany()).pipe(
    switchMap((records) =>
      iif(
        () => records.length === 0,
        defer(() =>
          from(
            prisma.playlist.create({
              data: {
                name: 'Default',
                internal: true,
              },
            }),
          ),
        ).pipe(
          catchError((err) => {
            console.error('Error seeding initial playlist:', err);

            return of(false);
          }),
          map(() => true),
        ),
        of(true),
      ),
    ),
  );

const seedUser = (): Observable<boolean> =>
  from(prisma.user.findMany()).pipe(
    switchMap((records) =>
      iif(
        () => records.length === 0,
        defer(() => from(hash('admin', saltRounds))).pipe(
          switchMap((password) =>
            from(
              prisma.user.create({
                data: {
                  name: 'admin',
                  displayName: 'Administrator',
                  password,
                },
              }),
            ),
          ),
          catchError((err) => {
            console.error('Error seeding initial user:', err);
            return of(false);
          }),
          map(() => true),
        ),
        of(true),
      ),
    ),
  );

async function main() {
  const ob$ = forkJoin([seedPlaylist(), seedUser()]);

  await lastValueFrom(ob$);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch(async () => {
    await prisma.$disconnect();
  });
