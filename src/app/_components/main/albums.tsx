'use client';

import { useContext, useMemo } from 'react';
import { useImmer } from 'use-immer';
import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { Heart, MoreHorizontal, MoveLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { ReactElement } from 'react';

import { useMediaStore } from '@/stores';
import { Button } from '@/components';

import MainContext from './context';
import TrackList from './track-list';
import Placeholder from './placeholder';

type State = { selectedAlbumId: number | null };

export default function Albums(): ReactElement {
  const t = useTranslations();
  const { albums = [] } = useMediaStore(
    useShallow(({ albums }) => ({
      albums,
    })),
  );

  const { onPlay, onFavoriteToggle } = useContext(MainContext);

  const [state, setState] = useImmer<State>({ selectedAlbumId: null });

  const { selectedAlbumId } = state;

  const selectedAlbum = useMemo(
    () => albums.find(({ id }) => id === selectedAlbumId) ?? null,
    [albums, selectedAlbumId],
  );
  const selectedTracks = useMemo(
    () => selectedAlbum?.tracks ?? [],
    [selectedAlbum],
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('Albums')}</h2>
        {selectedAlbum !== null && (
          <Button
            onClick={() =>
              setState((draft) => {
                draft.selectedAlbumId = null;
              })
            }
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            {t('Back to Albums')}
          </Button>
        )}
      </div>
      {albums.length > 0 && selectedAlbumId === null ? (
        <div className="space-y-2">
          {albums.map(({ id, name, tracks = [] }) => (
            <div
              key={id}
              className="flex items-center gap-4 p-3 rounded hover:bg-muted/50 group cursor-pointer"
              onClick={() =>
                setState((draft) => {
                  draft.selectedAlbumId = id;
                })
              }
            >
              <Image
                src={
                  tracks.find(({ cover }) => (cover ?? '').length > 0)?.cover ??
                  '/images/abstract-geometric-shapes.png'
                }
                alt={name}
                width={48}
                height={48}
                className="rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {tracks.find(({ artist }) => (artist ?? '').length > 0)
                    ?.artist ?? ''}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : selectedAlbumId !== null && selectedTracks.length > 0 ? (
        <TrackList
          tracks={selectedTracks}
          onPlay={onPlay}
          onFavoriteToggle={onFavoriteToggle}
        />
      ) : (
        <Placeholder />
      )}
    </div>
  );
}
