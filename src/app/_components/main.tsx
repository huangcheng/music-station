'use client';

import { useShallow } from 'zustand/react/shallow';
import Image from 'next/image';
import {
  Play,
  Heart,
  MoreHorizontal,
  Search,
  Filter,
  Clock,
  TrendingUp,
  Star,
  Download,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
} from '@/components';
import { useGlobalStore } from '@/providers';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
}

export default function Main() {
  const { nav } = useGlobalStore(useShallow(({ nav }) => ({ nav })));

  const sampleTracks: Track[] = [
    {
      id: '1',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      album: 'A Night at the Opera',
      duration: '5:55',
      cover: '/queen-bohemian-rhapsody-album-cover.png',
    },
    {
      id: '2',
      title: 'Hotel California',
      artist: 'Eagles',
      album: 'Hotel California',
      duration: '6:30',
      cover: '/eagles-hotel-california-album-cover.jpg',
    },
    {
      id: '3',
      title: 'Stairway to Heaven',
      artist: 'Led Zeppelin',
      album: 'Led Zeppelin IV',
      duration: '8:02',
      cover: '/led-zeppelin-iv-inspired-cover.png',
    },
    {
      id: '4',
      title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      album: 'Appetite for Destruction',
      duration: '5:03',
      cover: '/guns-roses-appetite-destruction-album.jpg',
    },
  ];

  const renderContent = () => {
    switch (nav) {
      case 'home': {
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
                {sampleTracks.slice(0, 6).map((track) => (
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
                {sampleTracks.map((track, index) => (
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
                      <p className="text-xs text-gray-600 truncate">
                        {track.artist}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'search': {
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-orange-600">Search</h2>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="What do you want to listen to?"
                    className="pl-10 h-12 text-lg bg-white music-shadow-soft border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                  />
                </div>
                <Button
                  variant="outline"
                  className="h-12 px-6 bg-white border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Browse all
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Rock', color: 'from-orange-500 to-red-500' },
                  { name: 'Pop', color: 'from-orange-400 to-pink-500' },
                  { name: 'Jazz', color: 'from-amber-500 to-orange-500' },
                  { name: 'Classical', color: 'from-orange-600 to-amber-600' },
                  { name: 'Hip Hop', color: 'from-gray-700 to-gray-900' },
                  {
                    name: 'Electronic',
                    color: 'from-orange-500 to-yellow-500',
                  },
                  { name: 'Country', color: 'from-amber-500 to-yellow-600' },
                  { name: 'R&B', color: 'from-orange-500 to-pink-600' },
                ].map((genre) => (
                  <Card
                    key={genre.name}
                    className={`aspect-square bg-gradient-to-br ${genre.color} hover:scale-105 transition-transform cursor-pointer music-shadow-medium music-card-hover`}
                  >
                    <CardContent className="p-6 flex items-end h-full relative overflow-hidden">
                      <h3 className="text-2xl font-bold text-white z-10">
                        {genre.name}
                      </h3>
                      <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full transform rotate-12"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'library':
      case 'playlists': {
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
                        src={`/abstract-geometric-shapes.png?height=200&width=200&query=${playlist.toLowerCase().replace(' ', '+')}+playlist+cover`}
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

      case 'albums': {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Albums</h2>
            <div className="space-y-2">
              {sampleTracks.map((track) => (
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

      case 'artists': {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Artists</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...new Set(sampleTracks.map((track) => track.artist))].map(
                (artist) => (
                  <Card
                    key={artist}
                    className="group hover:bg-card/80 transition-colors cursor-pointer"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="aspect-square bg-muted rounded-full mb-4 overflow-hidden">
                        <Image
                          src={`/abstract-geometric-shapes.png?height=200&width=200&query=${artist.toLowerCase().replace(' ', '+')}+artist+photo`}
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
                ),
              )}
            </div>
          </div>
        );
      }

      case 'liked': {
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                <Heart className="h-8 w-8 text-white fill-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Liked Songs</h2>
                <p className="text-muted-foreground">
                  {sampleTracks.length} songs
                </p>
              </div>
            </div>
            <div className="space-y-1">
              {sampleTracks.map((track, index) => (
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

      case 'settings': {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audio Quality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Streaming Quality</span>
                    <span className="text-sm text-muted-foreground">
                      High (320 kbps)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Download Quality</span>
                    <span className="text-sm text-muted-foreground">
                      Very High (320 kbps)
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Playback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Crossfade</span>
                    <span className="text-sm text-muted-foreground">Off</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gapless Playback</span>
                    <span className="text-sm text-muted-foreground">On</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }

      default: {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-gray-600">Select a section from the sidebar</p>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto bg-gray-50">{renderContent()}</div>
  );
}
