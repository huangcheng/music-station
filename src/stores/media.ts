import { create } from 'zustand';
import { forkJoin, lastValueFrom } from 'rxjs';

import { fetchArtists$, fetchMusic$ } from '@/hooks';

import type { Artist, Music } from '@/types';

interface MediaState {
  tracks: Music[];
  artists: Artist[];
}

interface MediaActions {
  fetchMusic: () => Promise<Music[]>;
  fetchArtists: () => Promise<Artist[]>;
  fetch: () => Promise<{ tracks: Music[]; artists: Artist[] }>;
}

export type MusicStore = MediaState & MediaActions;

export const useMediaStore = create<MusicStore>((set) => ({
  tracks: [],
  artists: [],
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
  fetch: async () => {
    const ob$ = forkJoin({
      tracks: fetchMusic$(),
      artists: fetchArtists$(),
    });

    const { tracks, artists } = await lastValueFrom(ob$);

    set({ tracks, artists });

    return { tracks, artists };
  },
}));
