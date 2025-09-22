'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useShallow } from 'zustand/react/shallow';
import { Settings, Plus, TrendingUp } from 'lucide-react';

import type { ReactElement, HTMLAttributes } from 'react';

import { cn } from '@/lib';
import { Button, ScrollArea, Badge } from '@/components';
import { DISCOVER_ITEMS, LIBRARY_ITEMS, NAVIGATION_ITEMS } from '@/constants';
import { useGlobalStore } from '@/providers';
import { useMediaStore } from '@/stores';

type SidebarProps = Readonly<HTMLAttributes<HTMLDivElement>>;

export default function Sidebar({
  className,
  ...rest
}: SidebarProps): ReactElement {
  const t = useTranslations();

  const { nav, setNav } = useGlobalStore(
    useShallow(({ nav, setNav }) => ({ nav, setNav })),
  );

  const { playlists, tracks, artists, albums } = useMediaStore(
    useShallow(({ playlists, tracks, artists, albums }) => ({
      playlists,
      tracks,
      artists,
      albums,
    })),
  );

  const likedTracks = useMemo(
    () => tracks.filter((track) => track.favorite === true),
    [tracks],
  );

  const libraryItems = useMemo(
    () =>
      LIBRARY_ITEMS.map((item) => {
        switch (item.id) {
          case 'playlists': {
            return { ...item, count: playlists.length };
          }
          case 'albums': {
            return { ...item, count: albums.length };
          }
          case 'artists': {
            return { ...item, count: artists.length };
          }
          case 'favorites': {
            return { ...item, count: likedTracks.length };
          }
          case 'tracks': {
            return { ...item, count: tracks.length };
          }
          default: {
            return item;
          }
        }
      }),
    [
      albums.length,
      artists.length,
      likedTracks.length,
      playlists.length,
      tracks.length,
    ],
  );

  return (
    <div
      className={cn(
        'w-72 bg-white border-r border-gray-200 h-full flex flex-col music-shadow-medium',
        className,
      )}
      {...rest}
    >
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-orange-600">
          {t('Music Station')}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {t('Your music, your way')}
        </p>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        {/* Main Navigation */}
        <div className="space-y-2 mb-8">
          {NAVIGATION_ITEMS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={nav === id ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 h-12 text-base font-medium transition-all duration-200 ${
                nav === id
                  ? 'bg-orange-500 text-white hover:bg-orange-600 music-shadow-soft'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:scale-105'
              }`}
              onClick={() => setNav(id)}
            >
              <Icon className="h-5 w-5" />
              {t(label)}
            </Button>
          ))}
        </div>

        {/* Discover Section */}
        <div className="space-y-2 mb-8">
          <h3 className="px-3 py-2 text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('Discover')}
          </h3>
          {DISCOVER_ITEMS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={nav === id ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 h-10 transition-all duration-200 ${
                nav === id
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              onClick={() => setNav(id)}
            >
              <Icon className="h-4 w-4" />
              {t(label)}
            </Button>
          ))}
        </div>

        {/* Library Section */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t('Your Library')}
            </h3>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-orange-50 hover:text-orange-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {libraryItems.map(({ id, label, count, icon: Icon }) => (
            <Button
              key={id}
              variant={nav === id ? 'default' : 'ghost'}
              className={`w-full justify-start gap-3 h-10 transition-all duration-200 ${
                nav === id
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
              onClick={() => setNav(id)}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1 text-left">{t(label)}</span>
              {count > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-orange-100 text-orange-700 border-orange-200"
                >
                  {count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Settings */}
        <div className="pt-4 border-t border-gray-100">
          <Button
            variant={nav === 'settings' ? 'default' : 'ghost'}
            className={`w-full justify-start gap-3 h-10 transition-all duration-200 ${
              nav === 'settings'
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
            onClick={() => setNav('settings')}
          >
            <Settings className="h-4 w-4" />
            {t('Settings')}
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
