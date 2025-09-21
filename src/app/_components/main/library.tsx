import Image from 'next/image';
import { Card, CardContent } from '@/components';

export default function Library() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Playlists</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[
          'My Favorites',
          'Road Trip',
          'Workout',
          'Chill Vibes',
          'Party Mix',
        ].map((playlist) => (
          <Card
            key={playlist}
            className="group hover:bg-card/80 transition-colors cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="aspect-square bg-muted rounded mb-4 flex items-center justify-center">
                <Image
                  src={`/abstract-geometric-shapes.png?height=200&width=200&query=${playlist
                    .toLowerCase()
                    .replace(' ', '+')}+playlist+cover`}
                  alt={playlist}
                  width={200}
                  height={200}
                  className="object-cover rounded"
                />
              </div>
              <h3 className="font-semibold truncate">{playlist}</h3>
              <p className="text-sm text-muted-foreground">
                Playlist • 25 songs
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
