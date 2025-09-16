import { createContext } from 'react';

export interface TracksContextProps {
  onClick?: (id: number) => void;
  onRefresh?: () => void;
}

const TracksContext = createContext<TracksContextProps>({});

export const TracksProvider = TracksContext.Provider;

export default TracksContext;
