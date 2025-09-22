import { Music, Headphones, Disc3, Users } from 'lucide-react';

import { Badge } from '@/components';

export default function Placeholder() {
  return (
    <div className="flex items-center justify-center h-full min-h-96">
      <div className="text-center max-w-md">
        <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-8 music-shadow-soft">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center music-shadow-soft">
            <Music className="h-10 w-10 text-orange-500" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Choose Your Music Journey
        </h3>
        <p className="text-gray-500 leading-relaxed mb-6">
          Select a section from the sidebar to start exploring your music
          library, discover new tracks, or manage your playlists.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-700 border-0"
          >
            <Headphones className="h-3 w-3 mr-1" />
            Playlists
          </Badge>
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-700 border-0"
          >
            <Disc3 className="h-3 w-3 mr-1" />
            Albums
          </Badge>
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-700 border-0"
          >
            <Users className="h-3 w-3 mr-1" />
            Artists
          </Badge>
        </div>
      </div>
    </div>
  );
}
