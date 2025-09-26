'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useMachine } from '@xstate/react';
import { createScope } from 'animejs';
import { useShallow } from 'zustand/react/shallow';
import { useLocalStorage, useMount } from 'react-use';

import type { ReactElement } from 'react';
import type { Scope } from 'animejs';
import type { Snapshot } from 'xstate';

import { useMediaStore } from '@/stores';
import { playerMachine } from '@/machines';

import { Sidebar, Main, Controls, MainContextProvider } from './_components';

import type { MainContextProps } from './_components';
import { useUpdatePlaylistMutation, useUpdateTrackMutation } from '@/hooks';

export default function Home(): ReactElement {
  const root = useRef<HTMLDivElement | null>(null);
  const scope = useRef<Scope | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const { fetch, tracks, playlists, playlistId } = useMediaStore(
    useShallow(({ fetch, tracks, playlists, playlistId }) => ({
      fetch,
      tracks,
      playlists,
      playlistId,
    })),
  );

  const defaultPlaylist = useMemo(
    () => playlists.find(({ internal }) => internal === true)!,
    [playlists],
  );

  const playlist = useMemo(() => {
    const target = playlists.find((p) => p.id === playlistId);

    return target ?? defaultPlaylist!;
  }, [playlists, playlistId, defaultPlaylist]);

  const _tracks = useMemo(() => playlist?.tracks ?? [], [playlist]);

  const { mutate: updatePlaylist } = useUpdatePlaylistMutation({
    onSuccess: async () => {
      await fetch();
    },
  });

  const { mutate: updateTrack } = useUpdateTrackMutation({
    onSuccess: async () => {
      await fetch();
    },
  });

  const [playerStateValue, setPlayerStateValue] =
    useLocalStorage('states/player');

  const [snapshot, send] = useMachine(playerMachine, {
    snapshot:
      Object.keys((playerStateValue as Snapshot<typeof playerMachine>) ?? {})
        .length === 0
        ? undefined
        : ({
            ...(playerStateValue as Snapshot<typeof playerMachine>),
            value: 'stopped',
          } as unknown as Snapshot<typeof playerMachine>),
  });

  const { context, value } = snapshot;

  const { track, loop, volume, time } = context ?? {};

  const handlePlay = useCallback(
    (id: number) => {
      const track = tracks.find((t) => t.id === id);

      if (!track) {
        return;
      }

      send({
        type: 'SET_TRACKS',
        tracks: [track],
      });

      updatePlaylist({
        id: defaultPlaylist?.id,
        params: {
          tracks: [id],
        },
      });

      send({
        type: 'SET_TRACK',
        id,
      });

      send({
        type: 'PLAY',
      });
    },
    [tracks, defaultPlaylist?.id, send, updatePlaylist],
  );

  const handlePlayPlaylist = useCallback(
    (id: number) => {
      const playlist = playlists.find((playlist) => playlist.id === id);

      if (!playlist) {
        return;
      }

      const { tracks = [] } = playlist;

      if (tracks.length === 0) {
        return;
      }

      send({
        type: 'SET_TRACKS',
        tracks,
      });

      send({
        type: 'SET_TRACK',
        id: tracks[0].id,
      });

      send({
        type: 'PLAY',
      });
    },
    [playlists, send],
  );

  const handleFavoriteToggle = useCallback(
    (id: number, favorite: boolean): void =>
      updateTrack({ id, params: { favorite } }),
    [updateTrack],
  );

  const mainContext = useMemo<MainContextProps>(
    () => ({
      playerContext: context,
      onPlay: handlePlay,
      onPlayPlaylist: handlePlayPlaylist,
      onFavoriteToggle: handleFavoriteToggle,
    }),
    [context, handlePlay, handleFavoriteToggle, handlePlayPlaylist],
  );

  useEffect(() => {
    scope.current = createScope({ root }).add(() => {});

    return () => scope.current?.revert();
  }, [root, scope]);

  // useEffect(() => {
  //   void fetch();
  // }, [fetch]);
  useMount(fetch);

  useEffect(() => {
    if (audio.current && volume !== undefined && volume >= 0) {
      audio.current.volume = Math.min(volume / 100, 1);
    }
  }, [audio, volume]);

  useEffect(() => {
    if (audio.current && track?.file !== undefined) {
      audio.current.src = track.file;
    }
  }, [audio, track]);

  useEffect(() => {
    if (_tracks.length > 0) {
      send({
        type: 'SET_TRACKS',
        tracks: _tracks ?? [],
      });
    }
  }, [_tracks, send]);

  useEffect(() => {
    if (audio.current) {
      switch (value) {
        case 'playing': {
          void audio.current.play();
          break;
        }
        case 'paused':
        case 'stopped': {
          audio.current.pause();
          break;
        }
        default: {
          break;
        }
      }
    }
  }, [audio, value, track]);

  useEffect(() => {
    setPlayerStateValue(snapshot);
  }, [snapshot, setPlayerStateValue]);

  useMount(() => {
    const value = playerStateValue as unknown as Snapshot<typeof playerMachine>;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const time = value?.context?.time ?? 0;

    if (audio.current) {
      audio.current.currentTime = time;
    }
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      <audio
        ref={audio}
        className="hidden"
        onTimeUpdate={(event) => {
          const target = event.target as HTMLAudioElement;

          send({ type: 'SET_TIME', time: target.currentTime });
        }}
        onEnded={() => {
          send({ type: 'STOP' });

          if (loop !== 'none') {
            setTimeout(() => {
              send({ type: 'PLAY_NEXT' });
            }, 100);
          }
        }}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContextProvider value={mainContext}>
          <Main />
        </MainContextProvider>
      </div>
      <Controls
        volume={volume}
        track={track}
        loop={loop}
        time={time}
        isPlaying={value === 'playing'}
        onPlayToggle={() => send({ type: 'TOGGLE_PLAY' })}
        onPrev={() => send({ type: 'PLAY_PREV' })}
        onNext={() => send({ type: 'PLAY_NEXT' })}
        onMuteToggle={() => send({ type: 'TOGGLE_MUTE' })}
        onTimeChange={(time) => {
          send({ type: 'SET_TIME', time });

          if (audio.current) {
            audio.current.currentTime = time;
          }
        }}
        onVolumeChange={(volume) => send({ type: 'SET_VOLUME', volume })}
        onLoopToggle={() => send({ type: 'SWITCH_LOOP' })}
      />
    </div>
  );
}
