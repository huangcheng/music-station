import { from } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { map } from 'rxjs/operators';
import { omit } from 'es-toolkit';

import type { Observable } from 'rxjs';

import type { Response, Music } from '@/types';

export const fetch$ = <R>(url: string, init?: RequestInit): Observable<R> =>
  fromFetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers,
    },
    ...(omit(init ?? {}, ['headers']) as RequestInit),
    selector: (response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return from(response.json() as Promise<Response<R>>).pipe(
        map(({ data }) => data),
      );
    },
  });

export const fetchMusic$ = () => fetch$<Music[]>('/api/music');
