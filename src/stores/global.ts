import { createStore } from 'zustand/vanilla';

type Nav = 'home' | 'albums' | 'playlists' | 'favorites' | 'settings';

export type GlobalState = {
  nav: Nav;
};

export type GlobalActions = {
  setNav: (nav: Nav) => void;
};

export type GlobalStore = GlobalState & GlobalActions;

export const initGlobalStore = (): GlobalState => {
  return { nav: 'home' };
};

export const defaultInitState: GlobalState = {
  nav: 'home',
};

export const createGlobalStore = (
  initState: GlobalState = defaultInitState,
) => {
  return createStore<GlobalStore>()((set) => ({
    ...initState,
    setNav: (nav: Nav) => set(() => ({ nav })),
  }));
};
