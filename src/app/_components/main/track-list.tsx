import Image from 'next/image';
import { Heart, MoreHorizontal, Play } from 'lucide-react';

import type { ReactElement, HTMLAttributes } from 'react';

import { cn, convertToMS } from '@/lib';
import { Button } from '@/components';

import type { Track } from '@/types';

export interface TrackListProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onPlay' | 'onClick'> {
  tracks: Track[];
  onPlay?: (id: number) => void;
  onClick?: (id: number) => void;
  onFavoriteToggle?: (id: number, favorite: boolean) => void;
}

export default function TrackList({
  tracks,
  onPlay,
  onClick,
  onFavoriteToggle,
  className,
  ...rest
}: TrackListProps): ReactElement {
  return (
    <div className={cn('space-y-1', className)} {...rest}>
      {tracks.map(({ id, name, cover, artist, duration, favorite }, index) => (
        <div
          key={id}
          className="flex items-center gap-4 p-3 rounded hover:bg-muted/50 group"
          onClick={() => onClick?.(id)}
        >
          <span className="w-4 text-sm text-muted-foreground">{index + 1}</span>
          <Image
            src={cover || '/images/abstract-geometric-shapes.png'}
            alt={name}
            width={40}
            height={40}
            className="rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{name}</h3>
            <p className="text-sm text-muted-foreground truncate">{artist}</p>
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
            <Button size="sm" variant="ghost" onClick={() => onPlay?.(id)}>
              <Play className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
