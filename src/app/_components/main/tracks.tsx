import { useContext } from 'react';
import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { Heart, MoreHorizontal, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { ReactElement } from 'react';

import { useMediaStore } from '@/stores';
import { Button } from '@/components';
import { cn, convertToMS } from '@/lib';

import MainContext from './context';
import Placeholder from './placeholder';

export default function Tracks(): ReactElement {
  const t = useTranslations();

  const { tracks } = useMediaStore(useShallow(({ tracks }) => ({ tracks })));

  const context = useContext(MainContext);

  const { onPlay, onFavoriteToggle } = context;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
          <Heart className="h-8 w-8 text-white fill-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{t('Tracks')}</h2>
          <p className="text-muted-foreground">
            {tracks.length} {t('songs')}
          </p>
        </div>
      </div>
      {tracks.length > 0 ? (
        <div className="space-y-1">
          {tracks.map(
            ({ id, name, cover, artist, duration, favorite }, index) => (
              <div
                key={id}
                className="flex items-center gap-4 p-3 rounded hover:bg-muted/50 group"
              >
                <span className="w-4 text-sm text-muted-foreground">
                  {index + 1}
                </span>
                <Image
                  src={cover || '/images/abstract-geometric-shapes.png'}
                  alt={name}
                  width={40}
                  height={40}
                  className="rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {artist}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {convertToMS(duration ?? 0)}
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      '!hover:text-accent',
                      favorite ? 'text-accent' : '',
                    )}
                    onClick={() => onFavoriteToggle?.(id, !favorite)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPlay?.(id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ),
          )}
        </div>
      ) : (
        <Placeholder />
      )}
    </div>
  );
}
