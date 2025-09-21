import { createContext } from 'react';

import { PlayerContext } from '@/machines';

export interface MainContext {
  context: PlayerContext;
}

const MainContext = createContext<MainContext | undefined>(undefined);

MainContext.displayName = 'MainContext';

export const MainContextProvider = MainContext.Provider;

export default MainContext;
