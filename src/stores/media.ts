import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { forkJoin, lastValueFrom } from 'rxjs';

import {
  fetchArtists$,
  fetchTracks$,
  fetchPlaylists$,
  fetchAlbums$,
  fetchGenre$,
} from '@/hooks';

import type { Album, Artist, Track, Playlist, Genre } from '@/types';

interface MediaState {
  tracks: Track[];
  artists: Artist[];
  playlists: Playlist[];
  albums: Album[];
  genre: Genre[];
  playlistId?: number;
}

interface MediaActions {
  fetchMusic: () => Promise<Track[]>;
  fetchArtists: () => Promise<Artist[]>;
  fetchPlaylists: () => Promise<Playlist[]>;
  fetchAlbums: () => Promise<Album[]>;
  fetchGenre: () => Promise<Genre[]>;
  setPlaylistId: (id?: number) => void;
  fetch: () => Promise<{ tracks: Track[]; artists: Artist[] }>;
}

export type MusicStore = MediaState & MediaActions;

export const useMediaStore = create<MusicStore>()(
  persist(
    (set) => ({
      tracks: [],
      artists: [],
      playlists: [],
      albums: [],
      genre: [],
      setPlaylistId: (id) => set({ playlistId: id }),
      fetchMusic: async () => {
        const tracks = await lastValueFrom(fetchTracks$());

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
      fetchGenre: async () => {
        const genre: Genre[] = await lastValueFrom(fetchGenre$());

        set({ genre });

        return genre;
      },
      fetch: async () => {
        const ob$ = forkJoin({
          tracks: fetchTracks$(),
          artists: fetchArtists$(),
          albums: fetchAlbums$(),
          playlists: fetchPlaylists$(),
          genre: fetchGenre$(),
        });

        const { tracks, artists, playlists, albums, genre } =
          await lastValueFrom(ob$);

        set({ tracks, artists, playlists, albums, genre });

        return { tracks, artists, playlists, albums, genre };
      },
    }),
    {
      name: 'media-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ playlistId }) => ({
        currentPlaylistId: playlistId,
      }),
    },
  ),
);
