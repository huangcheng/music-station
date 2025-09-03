import { create } from 'zustand';
import { lastValueFrom } from 'rxjs';

import { fetchMusic$ } from '@/hooks';

import type { Music } from '@/types';

interface MusicState {
  music: Music[];
}

interface MusicActions {
  fetchMusic: () => Promise<Music[]>;
}

export type MusicStore = MusicState & MusicActions;

export const useMusicStore = create<MusicStore>((set) => ({
  music: [],
  fetchMusic: async () => {
    const music = await lastValueFrom(fetchMusic$());

    set({ music });

    return music;
  },
}));
