'use client';

import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { useTranslations } from 'next-intl';
import { MoveLeft } from 'lucide-react';
import { useContext, useMemo } from 'react';
import { useImmer } from 'use-immer';

import { useMediaStore } from '@/stores';
import { Card, CardContent, Button } from '@/components';

import MainContext from './context';
import TrackList from './track-list';
import Placeholder from './placeholder';

type State = { selectedArtistId: number | null };

export default function Artists() {
  const t = useTranslations();
  const { artists } = useMediaStore(useShallow(({ artists }) => ({ artists })));

  const { onPlay, onFavoriteToggle } = useContext(MainContext);

  const [state, setState] = useImmer<State>({ selectedArtistId: null });

  const { selectedArtistId } = state;

  const selectedArtist = useMemo(
    () => artists.find(({ id }) => id === selectedArtistId) ?? null,
    [artists, selectedArtistId],
  );

  const selectedTracks = useMemo(
    () => selectedArtist?.tracks ?? [],
    [selectedArtist],
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('Artists')}</h2>
        {selectedArtist !== null && (
          <Button
            onClick={() =>
              setState((draft) => {
                draft.selectedArtistId = null;
              })
            }
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            {t('Back to Artists')}
          </Button>
        )}
      </div>

      {artists.length > 0 && selectedArtistId === null ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {artists.map(({ id, name, tracks }) => (
            <Card
              key={id}
              className="group hover:bg-card/80 transition-colors cursor-pointer"
              onClick={() =>
                setState((draft) => {
                  draft.selectedArtistId = id;
                })
              }
            >
              <CardContent className="p-4 text-center">
                <div className="aspect-square bg-muted rounded-full mb-4 overflow-hidden">
                  <Image
                    src={
                      tracks?.find(({ cover }) => cover)?.cover ??
                      '/images/abstract-geometric-shapes.png'
                    }
                    alt={name}
                    width={200}
                    height={200}
                    className="object-cover w-full aspect-square"
                  />
                </div>
                <h3 className="font-semibold truncate">{name}</h3>
                <p className="text-sm text-muted-foreground">{t('Artist')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : selectedArtistId !== null && selectedTracks.length > 0 ? (
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
