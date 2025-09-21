'use client';

import { useShallow } from 'zustand/react/shallow';

import { useGlobalStore } from '@/providers';
// Import extracted components
import Home from './home';
import Search from './search';
import Library from './library';
import Playlists from './playlists';
import Albums from './albums';
import Artists from './artists';
import Liked from './liked';
import Settings from './settings';
import Placeholder from './placeholder';

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
        return <Home tracks={sampleTracks} />;
      }
      case 'search': {
        return <Search />;
      }
      case 'library': {
        return <Library />;
      }
      case 'playlists': {
        return <Playlists />;
      }
      case 'albums': {
        return <Albums tracks={sampleTracks} />;
      }
      case 'artists': {
        return <Artists tracks={sampleTracks} />;
      }
      case 'liked': {
        return <Liked tracks={sampleTracks} />;
      }
      case 'settings': {
        return <Settings />;
      }
      default: {
        return <Placeholder />;
      }
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto bg-gray-50">{renderContent()}</div>
  );
}
