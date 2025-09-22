import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { ReactElement } from 'react';

import { Card, CardContent, Button, Input } from '@/components';
import { useMediaStore } from '@/stores';
import { getRandomGradientColor } from '@/lib';

import Placeholder from './placeholder';

export default function Search(): ReactElement {
  const t = useTranslations();
  const { genre } = useMediaStore(useShallow(({ genre }) => ({ genre })));

  const _genre = useMemo(
    () =>
      genre.map((g) => ({
        ...g,
        color: getRandomGradientColor(),
      })),
    [genre],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-orange-600">{t('Search')}</h2>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('What do you want to listen to?')}
              className="pl-10 h-12 text-lg bg-white music-shadow-soft border-gray-200 focus:border-orange-300 focus:ring-orange-200"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 px-6 bg-white border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('Filter')}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {t('Browse all')}
        </h3>
        {genre.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {_genre.map(({ id, name, color }) => (
              <Card
                key={id}
                className={`aspect-square bg-gradient-to-br ${color} hover:scale-105 transition-transform cursor-pointer music-shadow-medium music-card-hover`}
              >
                <CardContent className="p-6 flex items-end h-full relative overflow-hidden">
                  <h3 className="text-2xl font-bold text-white z-10">{name}</h3>
                  <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full transform rotate-12"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Placeholder />
        )}
      </div>
    </div>
  );
}
