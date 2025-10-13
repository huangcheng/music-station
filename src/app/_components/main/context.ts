import { createContext } from 'react';

import { PlayerContext } from '@/machines';

import type { Track } from '@/types';

export interface MainContextProps {
  playerContext?: PlayerContext;
  onPlay?: (id: number) => void;
  onPlayPlaylist?: (id: number) => void;
  onPlayTracks?: (tracks: Track[]) => void;
  onFavoriteToggle?: (id: number, favorite: boolean) => void;
}

const MainContext = createContext<MainContextProps>({});

MainContext.displayName = 'MainContext';

export const MainContextProvider = MainContext.Provider;

export default MainContext;
