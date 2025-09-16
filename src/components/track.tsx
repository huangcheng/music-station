import { useContext, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import Image from 'next/image';
import { HeartPulse, HeartCrack, EllipsisVertical } from 'lucide-react';

import type { ReactElement, HTMLAttributes } from 'react';

import { cn, convertToMS } from '@/lib';
import { TracksContext } from '@/app/_components/tracks';
import { favoriteMachine } from '@/machines';

export interface TrackProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'id' | 'onClick'> {
  id: number;
  cover?: string;
  title?: string;
  artist?: string;
  duration?: number;
  favorite?: boolean;
}

export default function Track({
  id,
  cover,
  title,
  artist,
  duration,
  favorite,
  className,
  ...rest
}: TrackProps): ReactElement {
  const context = useContext(TracksContext);

  const [snapshot, send] = useMachine(favoriteMachine, {
    input: {
      id,
    },
  });

  const {
    context: { favorite: isFavorite },
  } = snapshot;

  const { onClick } = context;

  useEffect(() => {
    send({ type: 'SYNC', favorite: favorite ?? false });
  }, [favorite, send]);

  return (
    <div
      className={cn(
        'rounded-xl p-4 flex flex-row items-center gap-x-5 bg-orange-200/40 shadow-lg',
        className,
      )}
      onClick={() => onClick?.(id)}
      {...rest}
    >
      {cover ? (
        <Image
          src={cover}
          alt="Cover"
          width={40}
          height={40}
          className="rounded-md"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-300 rounded-md" />
      )}
      <button
        onClick={(event) => {
          send({ type: 'TOGGLE' });

          event.stopPropagation();
        }}
      >
        {isFavorite ? (
          <HeartCrack size={20} color="#FF0000" />
        ) : (
          <HeartPulse size={20} color="#FF0000" />
        )}
      </button>
      <div className="flex-1 grid grid-cols-[2fr_8fr] items-center">
        <div className="flex flex-col items-center">
          <p className="text-base font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-600">{artist}</p>
        </div>
        <div className="flex-1">
          <p className="text-sm text-center text-gray-600">
            {convertToMS(duration ?? 0)}
          </p>
        </div>
      </div>
      <button onClick={() => alert(`More options for track ID: ${id}`)}>
        <EllipsisVertical size={20} className="text-gray-600" />
      </button>
    </div>
  );
}
