import { createContext } from 'react';

import { PlayerContext } from '@/machines';

export interface MainContextProps {
  playerContext?: PlayerContext;
  onPlay?: (id: number) => void;
  onFavoriteToggle?: (id: number, favorite: boolean) => void;
}

const MainContext = createContext<MainContextProps>({});

MainContext.displayName = 'MainContext';

export const MainContextProvider = MainContext.Provider;

export default MainContext;
