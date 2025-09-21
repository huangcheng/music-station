import Image from 'next/image';
import { Card, CardContent } from '@/components';

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

export default function Artists({ tracks }: Props) {
  const artists = [...new Set(tracks.map((t) => t.artist))];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Artists</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {artists.map((artist) => (
          <Card
            key={artist}
            className="group hover:bg-card/80 transition-colors cursor-pointer"
          >
            <CardContent className="p-4 text-center">
              <div className="aspect-square bg-muted rounded-full mb-4 overflow-hidden">
                <Image
                  src={`/abstract-geometric-shapes.png?height=200&width=200&query=${artist
                    .toLowerCase()
                    .replace(' ', '+')}+artist+photo`}
                  alt={artist}
                  width={200}
                  height={200}
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold truncate">{artist}</h3>
              <p className="text-sm text-muted-foreground">Artist</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
