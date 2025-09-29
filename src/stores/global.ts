import { createStore } from 'zustand/vanilla';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';

import { NAVIGATION_ITEMS, LIBRARY_ITEMS, DISCOVER_ITEMS } from '@/constants';

type NAV =
  | (typeof NAVIGATION_ITEMS)[number]['id']
  | (typeof LIBRARY_ITEMS)[number]['id']
  | (typeof DISCOVER_ITEMS)[number]['id']
  | 'settings';

export type GlobalState = {
  nav: NAV;
};

export type GlobalActions = {
  setNav: (nav: NAV) => void;
};

export type GlobalStore = GlobalState & GlobalActions;

export const defaultInitState: GlobalState = {
  nav: 'home',
};

export const initGlobalStore = (): GlobalState => defaultInitState;

export const createGlobalStore = (
  initState: GlobalState = defaultInitState,
) => {
  return createStore<GlobalStore>()(
    devtools(
      persist(
        (set) => ({
          ...initState,
          setNav: (nav: NAV) => set(() => ({ nav })),
        }),
        {
          name: 'global-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: ({ nav }) => ({ nav }),
        },
      ),
    ),
  );
};
