import Image from 'next/image';
import { Play, Heart, Clock, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components';

export interface Track {
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

export default function Home({ tracks }: Props) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 music-shadow-medium">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-orange-600">
              Good afternoon
            </h2>
            <p className="text-lg text-gray-600">
              Ready to discover your next favorite song?
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white music-shadow-soft">
              <Play className="h-4 w-4 mr-2" />
              Surprise Me
            </Button>
            <Button
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
            >
              <Heart className="h-4 w-4 mr-2" />
              My Mix
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
          <Clock className="h-5 w-5 text-orange-500" />
          Recently Played
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.slice(0, 6).map((track) => (
            <Card
              key={track.id}
              className="group music-card-hover cursor-pointer bg-white music-shadow-soft hover:music-shadow-medium"
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative">
                  <Image
                    src={track.cover || '/placeholder.svg'}
                    alt={track.album}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-gray-800">
                    {track.title}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {track.artist}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-orange-100 text-orange-700"
                    >
                      {track.duration}
                    </Badge>
                    <Star className="h-3 w-3 text-orange-500 fill-orange-500" />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Trending Now
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tracks.map((track, index) => (
            <Card
              key={track.id}
              className="group music-card-hover cursor-pointer bg-white music-shadow-soft hover:music-shadow-medium"
            >
              <CardContent className="p-4 text-center">
                <div className="relative mb-3">
                  <Image
                    src={track.cover || '/placeholder.svg'}
                    alt={track.album}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover shadow-md"
                  />
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">
                    #{index + 1}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm truncate text-gray-800">
                  {track.title}
                </h4>
                <p className="text-xs text-gray-600 truncate">{track.artist}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
