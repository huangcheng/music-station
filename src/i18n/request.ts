import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { from, lastValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export default getRequestConfig(async () => {
  const store = await cookies();

  const locale = store.get('locale')?.value ?? 'en-US';

  const messages$ = from(import(`../../locales/${locale}.json`)).pipe(
    catchError(() => import('../../locales/en-US.json')),
    map((module) => module.default),
  );

  return {
    locale,
    messages: await lastValueFrom(messages$),
  };
});
