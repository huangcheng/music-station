import { from } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { map } from 'rxjs/operators';
import { omit } from 'es-toolkit';

import type { Observable } from 'rxjs';

import type {
  Response,
  Music,
  Artist,
  Playlist,
  CreatePlayListRequest,
} from '@/types';

export const fetch$ = <R>(url: string, init?: RequestInit): Observable<R> =>
  fromFetch(`/api${url}`, {
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

export const fetchMusic$ = () => fetch$<Music[]>('/music');

export const fetchArtists$ = () => fetch$<Artist[]>('/artists');

export const fetchPlaylists$ = () => fetch$<Playlist[]>('/playlists');

export const addToDefaultPlaylist$ = (
  params: CreatePlayListRequest,
): Observable<Playlist> =>
  fetch$('/playlist', {
    method: 'POST',
    body: JSON.stringify(params),
  });

export const updatePlaylist$ = (id: number, params: CreatePlayListRequest) =>
  fetch$<Playlist>(`/playlist/${id}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });
