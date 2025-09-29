import { redirect } from 'next/navigation';
import { from } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { map } from 'rxjs/operators';
import { isServer } from '@tanstack/react-query';
import { omit } from 'es-toolkit';

import type { Observable } from 'rxjs';

import type {
  Response,
  Track,
  Artist,
  Album,
  Playlist,
  CreatePlaylistRequest,
  UpdateTrackRequest,
  Genre,
  UpdatePlaylistRequest,
  LoginRequest,
  User,
} from '@/types';

export const fetch$ = <R>(url: string, init?: RequestInit): Observable<R> =>
  fromFetch(`${isServer ? process.env.__NEXT_PRIVATE_ORIGIN : ''}/api${url}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers,
    },
    ...(omit(init ?? {}, ['headers']) as RequestInit),
    selector: (response) => {
      if (response.status === 401) {
        redirect('/login');
      }

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return from(response.json() as Promise<Response<R>>).pipe(
        map(({ data }) => data),
      );
    },
  });

export const fetchTracks$ = () => fetch$<Track[]>('/tracks');

export const fetchArtists$ = () => fetch$<Artist[]>('/artists');

export const fetchAlbums$ = () => fetch$<Album[]>('/albums');

export const fetchPlaylists$ = () => fetch$<Playlist[]>('/playlists');

export const createPlaylist$ = (
  params: CreatePlaylistRequest,
): Observable<Playlist> =>
  fetch$('/playlist', {
    method: 'POST',
    body: JSON.stringify(params),
  });

export const updatePlaylist$ = (id: number, params: UpdatePlaylistRequest) =>
  fetch$<Playlist>(`/playlist/${id}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });

export const deletePlaylist$ = (id: number) =>
  fetch$<void>(`/playlist/${id}`, {
    method: 'DELETE',
  });

export const updateTrack$ = (
  id: number,
  params: Partial<UpdateTrackRequest>,
): Observable<Track> =>
  fetch$<Track>(`/track/${id}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });

export const fetchGenre$ = () => fetch$<Genre[]>('/genre');

export const login$ = (params: LoginRequest) =>
  fetch$<User>('/login', {
    method: 'POST',
    body: JSON.stringify(params),
  });

export const fetchUser$ = (id: number) => fetch$<User>(`/user/${id}`);

export const fetchSelf$ = () => fetch$<User>('/user');

export const logout$ = () =>
  fetch$<void>('/logout', {
    method: 'POST',
  });
