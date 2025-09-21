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

export default function Liked({ tracks }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
          <Heart className="h-8 w-8 text-white fill-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Liked Songs</h2>
          <p className="text-muted-foreground">{tracks.length} songs</p>
        </div>
      </div>
      <div className="space-y-1">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="flex items-center gap-4 p-3 rounded hover:bg-muted/50 group"
          >
            <span className="w-4 text-sm text-muted-foreground">
              {index + 1}
            </span>
            <Image
              src={track.cover || '/placeholder.svg'}
              alt={track.album}
              width={40}
              height={40}
              className="rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{track.title}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {track.artist}
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              {track.duration}
            </span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="ghost">
                <Heart className="h-4 w-4 fill-accent text-accent" />
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
