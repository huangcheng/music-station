'use client';

import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { useTranslations } from 'next-intl';

import { useMediaStore } from '@/stores';
import { Card, CardContent } from '@/components';

export default function Artists() {
  const t = useTranslations();
  const { artists } = useMediaStore(useShallow(({ artists }) => ({ artists })));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('Artists')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {artists.map(({ id, name, tracks }) => (
          <Card
            key={id}
            className="group hover:bg-card/80 transition-colors cursor-pointer"
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
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold truncate">{name}</h3>
              <p className="text-sm text-muted-foreground">{t('Artist')}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
