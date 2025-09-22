import { defer, from, iif, lastValueFrom, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed initial data
  const playlist$ = from(prisma.playlist.findMany()).pipe(
    switchMap((records) =>
      iif(
        () => records.length === 0,
        defer(() =>
          from(
            prisma.playlist.create({
              data: {
                name: 'Default Playlist',
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

  await lastValueFrom(playlist$);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch(async () => {
    await prisma.$disconnect();
  });
