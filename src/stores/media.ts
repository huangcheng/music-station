import { create } from 'zustand';
import { forkJoin, lastValueFrom } from 'rxjs';

import { fetchArtists$, fetchMusic$ } from '@/hooks';

import type { Artist, Music } from '@/types';

interface MediaState {
  music: Music[];
  artists: Artist[];
}

interface MediaActions {
  fetchMusic: () => Promise<Music[]>;
  fetchArtists: () => Promise<Artist[]>;
  fetch: () => Promise<{ music: Music[]; artists: Artist[] }>;
}

export type MusicStore = MediaState & MediaActions;

export const useMediaStore = create<MusicStore>((set) => ({
  music: [],
  artists: [],
  fetchMusic: async () => {
    const music = await lastValueFrom(fetchMusic$());

    set({ music });

    return music;
  },
  fetchArtists: async () => {
    const artists = await lastValueFrom(fetchArtists$());

    set({ artists });

    return artists;
  },
  fetch: async () => {
    const ob$ = forkJoin({
      music: fetchMusic$(),
      artists: fetchArtists$(),
    });

    const { music, artists } = await lastValueFrom(ob$);

    set({ music, artists });

    return { music, artists };
  },
}));
