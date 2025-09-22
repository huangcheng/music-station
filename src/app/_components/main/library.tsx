import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { useTranslations } from 'next-intl';

import { useMediaStore } from '@/stores';
import { Card, CardContent } from '@/components';

import Placeholder from './placeholder';

export default function Library() {
  const t = useTranslations();
  const { playlists } = useMediaStore(
    useShallow(({ playlists }) => ({
      playlists,
    })),
  );
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('Your Playlists')}</h2>
      {playlists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {playlists.map(({ id, name, tracks }) => (
            <Card
              key={id}
              className="group hover:bg-card/80 transition-colors cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded mb-4 flex items-center justify-center">
                  <Image
                    src={
                      tracks.find(({ cover }) => cover)?.cover ??
                      '/images/abstract-geometric-shapes.png'
                    }
                    alt={name}
                    width={200}
                    height={200}
                    className="object-fill rounded"
                  />
                </div>
                <h3 className="font-semibold truncate">{name}</h3>
                <p className="text-sm text-muted-foreground">
                  {name} • {tracks.length} {t('songs')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Placeholder />
      )}
    </div>
  );
}
