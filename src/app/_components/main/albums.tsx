'use client';

import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { Heart, MoreHorizontal } from 'lucide-react';

import type { ReactElement } from 'react';

import { useMediaStore } from '@/stores';
import { Button } from '@/components';
import Placeholder from './placeholder';

export default function Albums(): ReactElement {
  const { albums = [] } = useMediaStore(
    useShallow(({ albums }) => ({
      albums,
    })),
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Albums</h2>
      {albums.length > 0 ? (
        <div className="space-y-2">
          {albums.map(({ id, name, tracks = [] }) => (
            <div
              key={id}
              className="flex items-center gap-4 p-3 rounded hover:bg-muted/50 group"
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
      ) : (
        <Placeholder />
      )}
    </div>
  );
}
