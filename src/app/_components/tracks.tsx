'use client';

import { useShallow } from 'zustand/react/shallow';

import type { ReactElement, HTMLAttributes } from 'react';

import { cn } from '@/lib';
import { Track } from '@/components';
import { useMediaStore } from '@/stores';

import type { TrackProps } from '@/components';

export type TracksProps = Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> &
  Pick<TrackProps, 'onClick'>;

export default function Tracks({
  className,
  onClick,
  ...rest
}: TracksProps): ReactElement {
  const { tracks } = useMediaStore(useShallow(({ tracks }) => ({ tracks })));

  return (
    <div
      className={cn(
        'w-full overflow-x-hidden overflow-y-auto flex flex-col gap-y-4',
        className,
      )}
      {...rest}
    >
      {tracks?.map(({ id, cover, artist, name, duration }) => (
        <Track
          key={id}
          id={id}
          title={name}
          artist={artist}
          duration={duration ?? 0}
          cover={cover}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
