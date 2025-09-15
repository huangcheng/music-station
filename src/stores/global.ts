import { createStore } from 'zustand/vanilla';

export type GlobalState = {
  version: string;
};

export type GlobalActions = {
  setVersion: (version: string) => void;
};

export type GlobalStore = GlobalState & GlobalActions;

export const initGlobalStore = (): GlobalState => {
  return { version: '0.0.0' };
};

export const defaultInitState: GlobalState = {
  version: '0.0.0',
};

export const createGlobalStore = (
  initState: GlobalState = defaultInitState,
) => {
  return createStore<GlobalStore>()((set) => ({
    ...initState,
    setVersion: (version: string) => set(() => ({ version })),
  }));
};
