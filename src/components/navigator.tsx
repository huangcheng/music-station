'use client';

import { useShallow } from 'zustand/react/shallow';
import { Album, Heart, Home, ListMusic, Settings } from 'lucide-react';

import type { ReactElement } from 'react';

import { useGlobalStore } from '@/providers';
import { cn } from '@/lib';

export default function Navigator(): ReactElement {
  const { nav, setNav } = useGlobalStore(
    useShallow(({ nav, setNav }) => ({ nav, setNav })),
  );

  return (
    <div className="rounded-full flex flex-col items-center justify-center gap-y-8 py-8 bg-black">
      <button
        className="h-6 w-6"
        onClick={() => {
          setNav('home');
        }}
      >
        <Home
          size={24}
          className={cn(nav === 'home' ? 'text-white' : 'text-gray-400')}
        />
      </button>
      <button
        className="h-6 w-6"
        onClick={() => {
          setNav('albums');
        }}
      >
        <Album
          size={24}
          className={cn(nav === 'albums' ? 'text-white' : 'text-gray-400')}
        />
      </button>
      <button
        className="h-6 w-6"
        onClick={() => {
          setNav('playlists');
        }}
      >
        <ListMusic
          size={24}
          className={cn(nav === 'playlists' ? 'text-white' : 'text-gray-400')}
        />
      </button>
      <button
        className="h-6 w-6"
        onClick={() => {
          setNav('favorites');
        }}
      >
        <Heart
          size={24}
          className={cn(nav === 'favorites' ? 'text-white' : 'text-gray-400')}
        />
      </button>
      <button
        className="h-6 w-6"
        onClick={() => {
          setNav('settings');
        }}
      >
        <Settings
          size={24}
          className={cn(nav === 'settings' ? 'text-white' : 'text-gray-400')}
        />
      </button>
    </div>
  );
}
