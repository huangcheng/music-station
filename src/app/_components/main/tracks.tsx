import { useContext } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';

import type { ReactElement } from 'react';

import { useMediaStore } from '@/stores';

import MainContext from './context';
import Placeholder from './placeholder';
import TrackList from './track-list';

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
        <TrackList
          tracks={tracks}
          onPlay={onPlay}
          onFavoriteToggle={onFavoriteToggle}
        />
      ) : (
        <Placeholder />
      )}
    </div>
  );
}
