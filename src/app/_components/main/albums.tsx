import Image from 'next/image';
import { Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
}

interface Props {
  tracks: Track[];
}

export default function Albums({ tracks }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Albums</h2>
      <div className="space-y-2">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-4 p-3 rounded hover:bg-muted/50 group"
          >
            <Image
              src={track.cover || '/placeholder.svg'}
              alt={track.album}
              width={48}
              height={48}
              className="rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{track.album}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {track.artist}
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
    </div>
  );
}
