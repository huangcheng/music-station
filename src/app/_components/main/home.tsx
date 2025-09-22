import { useContext, useMemo } from 'react';
import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { Play, Heart, Clock, TrendingUp, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { ReactElement } from 'react';

import { Card, CardContent, Button, Badge } from '@/components';
import { useMediaStore } from '@/stores';
import { convertToMS } from '@/lib';

import MainContext from './context';

import type { MainContextProps } from './context';

import Placeholder from './placeholder';

export default function Home(): ReactElement {
  const t = useTranslations();
  const { tracks } = useMediaStore(useShallow(({ tracks }) => ({ tracks })));

  const { onPlay } = useContext<MainContextProps>(MainContext);

  const recentlyPlayedTracks = useMemo(
    () =>
      tracks
        .filter(({ recentlyPlayed }) => recentlyPlayed > 0)
        .sort((a, b) => (b?.recentlyPlayed ?? 0) - a?.recentlyPlayed)
        .slice(0, 10),
    [tracks],
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    }

    if (hour < 18) {
      return 'Good Afternoon';
    }

    return 'Good Evening';
  }, []);

  const trendingTracks = useMemo(
    () => tracks.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)).slice(0, 10),
    [tracks],
  );
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 music-shadow-medium">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-orange-600">
              {t(greeting)}
            </h2>
            <p className="text-lg text-gray-600">
              {t('Ready to discover your next favorite song?')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white music-shadow-soft">
              <Play className="h-4 w-4 mr-2" />
              {t('Surprise Me')}
            </Button>
            <Button
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
            >
              <Heart className="h-4 w-4 mr-2" />
              {t('My Mix')}
            </Button>
          </div>
        </div>
      </div>

      {recentlyPlayedTracks.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <Clock className="h-5 w-5 text-orange-500" />
            {t('Recently Played')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyPlayedTracks.map(
              ({ id, cover, name, artist, duration }) => (
                <Card
                  key={id}
                  className="group music-card-hover cursor-pointer bg-white music-shadow-soft hover:music-shadow-medium"
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="relative">
                      <Image
                        src={cover || '/placeholder.svg'}
                        alt={name}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover shadow-md aspect-square"
                      />
                      <button
                        className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        onClick={() => onPlay?.(id)}
                      >
                        <Play className="h-6 w-6 text-white" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate text-gray-800">
                        {name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{artist}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-orange-100 text-orange-700"
                        >
                          {convertToMS(duration ?? 0)}
                        </Badge>
                        <Star className="h-3 w-3 text-orange-500 fill-orange-500" />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => onPlay?.(id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </div>
      )}

      {trendingTracks.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            {t('Trending Now')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingTracks.map(({ id, cover, name, artist }, index) => (
              <Card
                key={id}
                className="group music-card-hover cursor-pointer bg-white music-shadow-soft hover:music-shadow-medium"
              >
                <CardContent className="p-4 text-center">
                  <div className="relative mb-3">
                    <Image
                      src={cover || '/placeholder.svg'}
                      alt={name}
                      width={200}
                      height={200}
                      className="rounded-lg object-cover shadow-md aspect-2/3"
                    />
                    <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">
                      #{index + 1}
                    </Badge>
                    <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        className="bg-accent hover:bg-accent/90 text-accent-foreground w-12 h-12 rounded-full shadow-lg music-glow transition-all duration-200 hover:scale-110 flex items-center justify-center"
                        onClick={() => onPlay?.(id)}
                      >
                        <Play className="h-6 w-6 text-white" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-medium text-sm truncate text-gray-800">
                    {name}
                  </h4>
                  <p className="text-xs text-gray-600 truncate">{artist}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {trendingTracks.length === 0 && recentlyPlayedTracks.length === 0 && (
        <Placeholder />
      )}
    </div>
  );
}
