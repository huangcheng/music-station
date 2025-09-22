'use client';

import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import type { ReactElement } from 'react';

import { useGlobalStore } from '@/providers';

import Home from './home';
import Search from './search';
import Library from './library';
import Playlists from './playlists';
import Albums from './albums';
import Artists from './artists';
import Liked from './liked';
import Settings from './settings';
import Placeholder from './placeholder';

export default function Main(): ReactElement {
  const { nav } = useGlobalStore(useShallow(({ nav }) => ({ nav })));

  const Content = useCallback((): ReactElement => {
    switch (nav) {
      case 'home': {
        return <Home />;
      }
      case 'search': {
        return <Search />;
      }
      case 'library': {
        return <Library />;
      }
      case 'playlists': {
        return <Playlists />;
      }
      case 'albums': {
        return <Albums />;
      }
      case 'artists': {
        return <Artists />;
      }
      case 'liked': {
        return <Liked />;
      }
      case 'settings': {
        return <Settings />;
      }
      default: {
        return <Placeholder />;
      }
    }
  }, [nav]);

  return (
    <div className="flex-1 p-8 overflow-auto bg-gray-50">
      <Content />
    </div>
  );
}
