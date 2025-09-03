'use client';

import { useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useImmer } from 'use-immer';
import { useTranslations } from 'next-intl';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  ChevronRight,
  ChevronDown,
  Music,
} from 'lucide-react';

import type { ReactElement } from 'react';

import { Button } from '@/components';
import { useMediaStore } from '@/stores';

interface Track {
  id: number;
  artist: string;
  album: string;
  title: string;
  duration: string;
  playing?: boolean;
}

interface LibraryItem {
  id: number;
  label: string;
  count?: number;
  expandable?: boolean;
  children?: LibraryItem[];
}

export default function Foobar2000Player() {
  const t = useTranslations('Player');
  const { artists } = useMediaStore(useShallow(({ artists }) => ({ artists })));

  const [state, setState] = useImmer<{
    expandedKeys: number[];
  }>({
    expandedKeys: [0],
  });

  const { expandedKeys } = state;

  const tree = useMemo<LibraryItem[]>(
    () => [
      {
        id: 0,
        label: t('All Music'),
        count: artists.reduce((acc, cur) => acc + cur.musics?.length, 0),
        expandable: false,
        children: artists.map(({ id, name, musics }) => ({
          id: id,
          label: name,
          count: musics?.length || 0,
          expandable: true,
          children: musics.map((music) => ({
            id: music.id,
            label: music.name,
          })),
        })),
      },
    ],
    [artists, t],
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  const tracks: Track[] = [
    {
      id: 1,
      artist: 'F.I.R.飞儿乐团',
      album: 'F.I.R.',
      title: 'Lydia',
      duration: '3:59',
      playing: true,
    },
    {
      id: 2,
      artist: 'Various Artists',
      album: 'Compilation',
      title: 'Sample Track 1',
      duration: '4:23',
    },
    {
      id: 3,
      artist: 'Various Artists',
      album: 'Compilation',
      title: 'Sample Track 2',
      duration: '3:45',
    },
  ];

  const generateLibraryTree = useCallback(
    (tree: LibraryItem[], level = 0): ReactElement[] =>
      tree.map(({ id, label, count, expandable, children }, index) => (
        <div className="text-xs" key={id}>
          <div
            key={index}
            className="flex items-center py-0.5 px-1 hover:bg-blue-100 cursor-pointer"
            style={{ paddingLeft: `${level * 12 + 4}px` }}
            onClick={() => {
              setState((draft) => {
                if (children && expandable) {
                  const pos = draft.expandedKeys.indexOf(id);

                  if (pos === -1) {
                    draft.expandedKeys.push(id);
                  } else {
                    draft.expandedKeys.splice(pos, 1);
                  }
                }
              });
            }}
          >
            {children ? (
              expandedKeys.includes(id) ? (
                <ChevronDown className="w-3 h-3 mr-1" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1" />
              )
            ) : (
              <div className="w-4 mr-1" />
            )}
            <Music className="w-3 h-3 mr-1" />
            <span className="flex-1">{label}</span>
            {count && <span className="text-gray-600">({count})</span>}
          </div>
          {expandedKeys.includes(id) &&
            children &&
            generateLibraryTree(children, level + 1)}
        </div>
      )),
    [expandedKeys, setState],
  );

  return (
    <div className="h-screen bg-gray-200 flex flex-col font-sans text-sm">
      {/* Menu Bar */}
      <div className="bg-gray-100 border-b border-gray-400 px-2 py-1">
        <div className="flex space-x-4 text-xs">
          <span className="hover:bg-gray-200 px-2 py-1 cursor-pointer">
            File
          </span>
          <span className="hover:bg-gray-200 px-2 py-1 cursor-pointer">
            Edit
          </span>
          <span className="hover:bg-gray-200 px-2 py-1 cursor-pointer">
            View
          </span>
          <span className="hover:bg-gray-200 px-2 py-1 cursor-pointer">
            Playback
          </span>
          <span className="hover:bg-gray-200 px-2 py-1 cursor-pointer">
            Library
          </span>
          <span className="hover:bg-gray-200 px-2 py-1 cursor-pointer">
            Help
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-100 border-b border-gray-400 px-2 py-1 flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-gray-200"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="w-3 h-3" />
          ) : (
            <Play className="w-3 h-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-gray-200"
        >
          <Square className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-gray-200"
        >
          <SkipBack className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-gray-200"
        >
          <SkipForward className="w-3 h-3" />
        </Button>
        <div className="w-px h-4 bg-gray-400 mx-2" />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-gray-200"
        >
          <Volume2 className="w-3 h-3" />
        </Button>
        <div className="flex-1" />
        <div className="text-xs text-gray-600">Default Playlist</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Library */}
        <div className="w-80 bg-white border-r border-gray-400 flex flex-col">
          <div className="bg-gray-100 border-b border-gray-400 px-2 py-1 text-xs font-semibold">
            Library
          </div>
          <div className="flex-1 overflow-y-auto p-1">
            {generateLibraryTree(tree)}
          </div>
          <div className="border-t border-gray-400 p-1">
            <input
              type="text"
              placeholder="Filter"
              className="w-full text-xs px-2 py-1 border border-gray-300"
            />
          </div>
        </div>

        {/* Main Playlist Area */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Playlist Header */}
          <div className="bg-gray-100 border-b border-gray-400 px-2 py-1 text-xs font-semibold">
            Default Playlist
          </div>

          {/* Column Headers */}
          <div className="bg-gray-100 border-b border-gray-300 flex text-xs font-semibold">
            <div className="w-8 px-2 py-1 border-r border-gray-300">Play</div>
            <div className="flex-1 px-2 py-1 border-r border-gray-300">
              Artist/Album
            </div>
            <div className="w-16 px-2 py-1 border-r border-gray-300 text-center">
              Track
            </div>
            <div className="flex-1 px-2 py-1 border-r border-gray-300">
              Title / track artist
            </div>
            <div className="w-16 px-2 py-1 text-center">Dur.</div>
          </div>

          {/* Playlist Items */}
          <div className="flex-1 overflow-y-auto">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`flex text-xs border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                  track.playing ? 'bg-blue-100' : ''
                }`}
                onClick={() => setCurrentTrack(index)}
              >
                <div className="w-8 px-2 py-1 border-r border-gray-200 text-center">
                  {track.playing && <Play className="w-3 h-3 mx-auto" />}
                </div>
                <div className="flex-1 px-2 py-1 border-r border-gray-200 truncate">
                  {track.artist}
                </div>
                <div className="w-16 px-2 py-1 border-r border-gray-200 text-center">
                  1.03
                </div>
                <div className="flex-1 px-2 py-1 border-r border-gray-200 truncate">
                  {track.title}
                </div>
                <div className="w-16 px-2 py-1 text-center">
                  {track.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar and Waveform */}
      <div className="bg-gray-100 border-t border-gray-400">
        {/* Waveform Area */}
        <div className="h-20 bg-black relative overflow-hidden">
          <div className="absolute inset-0 flex items-end justify-center">
            {/* Simulated waveform */}
            <div className="flex items-end space-x-px h-full w-full max-w-4xl">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-green-400 w-1"
                  style={{
                    height: `${Math.random() * 60 + 10}%`,
                    opacity: i < 60 ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-2 py-1 text-xs text-gray-700 flex items-center space-x-4">
          <span>FLAC | 44100 kbps | 192000 Hz | stereo | 0:10 / 3:59</span>
        </div>
      </div>
    </div>
  );
}
