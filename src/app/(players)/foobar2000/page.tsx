'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
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
import { toLibraryTree } from '@/lib';
import {
  useAddToDefaultPlaylistMutation,
  useArtistsQuery,
  useMusicQuery,
  usePlaylistsQuery,
  useUpdatePlaylistMutation,
} from '@/hooks';

import type { Playlist, Music as MusicType } from '@/types';

interface LibraryItem {
  id: number;
  label: string;
  count?: number;
  expandable?: boolean;
  children?: LibraryItem[];
}

export default function Foobar2000Player() {
  const audio = useRef<HTMLAudioElement | null>(null);

  const t = useTranslations('Player');

  const [state, setState] = useImmer<{
    expandedKeys: number[];
    currentPlaylist: number;
  }>({
    expandedKeys: [0],
    currentPlaylist: 0,
  });

  const { expandedKeys, currentPlaylist } = state;

  const { data: artists = [] } = useArtistsQuery();
  const { data: music = [] } = useMusicQuery();
  const { data: _playlists = [] } = usePlaylistsQuery();
  const { mutate: createPlaylistMutate, isPending } =
    useAddToDefaultPlaylistMutation();
  const { mutate: updatePlaylistMutate } = useUpdatePlaylistMutation();

  const tree = useMemo<LibraryItem[]>(
    () =>
      toLibraryTree([
        {
          id: 0,
          name: t('All Music'),
          expandable: false,
          children: artists,
        },
      ]),
    [artists, t],
  );

  const playlists = useMemo<
    (Omit<Playlist, 'music'> & { music: MusicType[] })[]
  >(
    () =>
      _playlists?.map(({ music: m, ...rest }) => ({
        ...rest,
        music: (m ?? [])
          .map((id) => music.find((m) => m.id === id))
          .filter(Boolean) as MusicType[],
      })),
    [_playlists, music],
  );

  const playlist = useMemo(
    () => playlists?.[currentPlaylist],
    [playlists, currentPlaylist],
  );

  const [isPlaying, setIsPlaying] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setCurrentTrack] = useState(0);

  const addToPlaylist = useCallback(
    (id: number) => {
      if (!playlist && !isPending) {
        createPlaylistMutate({
          name: 'Default Playlist',
          music: [id],
        });

        return;
      }

      if (playlist && !isPending) {
        updatePlaylistMutate({
          id: playlist.id,
          params: {
            name: playlist.name,
            music: [...new Set([...playlist.music.map(({ id }) => id), id])],
          },
        });
      }
    },
    [playlist, isPending, createPlaylistMutate, updatePlaylistMutate],
  );

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
            onDoubleClick={() => {
              if (!children || children.length === 0) {
                addToPlaylist(id);
              }
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
    [expandedKeys, setState, addToPlaylist],
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

        <audio ref={audio} className="opacity-0" />
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
            {playlist?.name ?? t('Default Playlist')}
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
            {(playlist?.music ?? []).map(({ id, name, artist, file }) => (
              <div
                key={id}
                className={`flex text-xs border-b border-gray-200 hover:bg-blue-50 cursor-pointer ${
                  /* track.playing */ false ? 'bg-blue-100' : ''
                }`}
                onClick={() => setCurrentTrack(id)}
                onDoubleClick={() => {
                  if (audio.current) {
                    audio.current.src = `/api/upload?file=${file}`;
                    audio.current.play();

                    setIsPlaying(true);
                  }
                }}
              >
                {/*<div className="w-8 px-2 py-1 border-r border-gray-200 text-center">*/}
                {/*  {track.playing && <Play className="w-3 h-3 mx-auto" />}*/}
                {/*</div>*/}
                <div className="flex-1 px-2 py-1 border-r border-gray-200 truncate">
                  {artist}
                </div>
                <div className="w-16 px-2 py-1 border-r border-gray-200 text-center">
                  1.03
                </div>
                <div className="flex-1 px-2 py-1 border-r border-gray-200 truncate">
                  {name}
                </div>
                {/*<div className="w-16 px-2 py-1 text-center">*/}
                {/*  {track.duration}*/}
                {/*</div>*/}
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
