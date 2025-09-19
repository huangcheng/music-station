import { create } from 'zustand';
import { forkJoin, lastValueFrom } from 'rxjs';

import {
  fetchArtists$,
  fetchMusic$,
  fetchPlaylists$,
  fetchAlbums$,
} from '@/hooks';

import type { Album, Artist, Music, Playlist } from '@/types';

interface MediaState {
  tracks: Music[];
  artists: Artist[];
  playlists: Playlist[];
  albums: Album[];
}

interface MediaActions {
  fetchMusic: () => Promise<Music[]>;
  fetchArtists: () => Promise<Artist[]>;
  fetchPlaylists: () => Promise<Playlist[]>;
  fetchAlbums: () => Promise<Album[]>;
  fetch: () => Promise<{ tracks: Music[]; artists: Artist[] }>;
}

export type MusicStore = MediaState & MediaActions;

export const useMediaStore = create<MusicStore>((set) => ({
  tracks: [],
  artists: [],
  playlists: [],
  albums: [],
  fetchMusic: async () => {
    const tracks = await lastValueFrom(fetchMusic$());

    set({ tracks });

    return tracks;
  },
  fetchArtists: async () => {
    const artists = await lastValueFrom(fetchArtists$());

    set({ artists });

    return artists;
  },
  fetchPlaylists: async () => {
    const playlists: Playlist[] = await lastValueFrom(fetchPlaylists$());

    set({ playlists });

    return playlists;
  },
  fetchAlbums: async () => {
    const albums: Album[] = await lastValueFrom(fetchAlbums$());

    set({ albums });

    return albums;
  },
  fetch: async () => {
    const ob$ = forkJoin({
      tracks: fetchMusic$(),
      artists: fetchArtists$(),
      albums: fetchAlbums$(),
      playlists: fetchPlaylists$(),
    });

    const { tracks, artists, playlists, albums } = await lastValueFrom(ob$);

    set({ tracks, artists, playlists, albums });

    return { tracks, artists, playlists, albums };
  },
}));
