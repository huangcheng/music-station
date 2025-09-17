'use client';

import { useCallback, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useImmer } from 'use-immer';
import { fromEvent } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { useObservable, useSubscription } from 'observable-hooks';
import { useMachine } from '@xstate/react';
import { createScope, animate } from 'animejs';
import { useShallow } from 'zustand/react/shallow';
import { useLocalStorage, useMount } from 'react-use';
import {
  Home as HomeIcon,
  Album,
  Heart,
  HeartPulse,
  ListMusic,
  Settings,
  Shuffle,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';

import type { ReactElement } from 'react';
import type { Scope } from 'animejs';
import type { Snapshot } from 'xstate';

import { cn, formatSampleRate } from '@/lib';
import { useMediaStore } from '@/stores';
import { playerMachine } from '@/machines';
import { Slider } from '@/components';

import { Tracks, TracksProvider } from './_components';

type State = {
  nav: 'home' | 'albums' | 'playlists' | 'favorites' | 'settings';
  canvasHeight: number;
  canvasOffset: number;
};

export default function Home(): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement | null>(null);
  const scope = useRef<Scope | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const { fetch, tracks } = useMediaStore(
    useShallow(({ fetch, tracks }) => ({
      fetch,
      tracks,
    })),
  );

  const [playerStateValue, setPlayerStateValue] =
    useLocalStorage('states/player');

  const [snapshot, send] = useMachine(playerMachine, {
    input: {
      tracks: tracks ?? [],
    },
    snapshot:
      Object.keys((playerStateValue as Snapshot<typeof playerMachine>) ?? {})
        .length === 0
        ? undefined
        : ({
            ...(playerStateValue as Snapshot<typeof playerMachine>),
            value: 'stopped',
          } as unknown as Snapshot<typeof playerMachine>),
  });

  const [state, setState] = useImmer<State>({
    nav: 'home',
    canvasHeight: 0,
    canvasOffset: 0,
  });

  const { nav, canvasHeight } = state;

  const { context, value } = snapshot;

  const { track, loop, volume } = context ?? {};

  const setNav = useCallback(
    (nav: State['nav']) => {
      setState((draft) => {
        draft.nav = nav;
      });
    },
    [setState],
  );

  const scrollTo = useCallback(
    (top: number) => {
      scope.current?.methods?.scrollTo(top);
    },
    [scope],
  );

  const resize$ = useObservable(
    (inputs$) =>
      inputs$.pipe(
        switchMap(([ref, setState]) =>
          fromEvent(globalThis, 'resize').pipe(
            map(() => ref.current?.clientHeight ?? 0),
            tap((height) => {
              setState((draft) => {
                draft.canvasHeight = height;
              });
            }),
          ),
        ),
      ),
    [ref, setState],
  );

  useSubscription(resize$);

  const handleTrackClick = useCallback(
    (id: number) => {
      send({
        type: 'SET_TRACK',
        id,
      });

      send({
        type: 'PLAY',
      });
    },
    [send],
  );

  const handleRefresh = useCallback(() => {
    void fetch();
  }, [fetch]);

  const tracksContext = useMemo(
    () => ({ onClick: handleTrackClick, onRefresh: handleRefresh }),
    [handleTrackClick, handleRefresh],
  );

  const Loop = useCallback((): ReactElement => {
    switch (loop) {
      case 'one': {
        return <Repeat1 size={20} />;
      }
      case 'all': {
        return <Repeat size={20} />;
      }
      case 'shuffle': {
        return <Shuffle size={20} />;
      }
      default: {
        return <Repeat1 size={20} color="#8E929B" />;
      }
    }
  }, [loop]);

  const Volume = useCallback((): ReactElement => {
    if (volume === 0) {
      return <VolumeX size={20} />;
    }

    if (volume && volume <= 50) {
      return <Volume1 size={20} />;
    }

    return <Volume2 size={20} />;
  }, [volume]);

  useEffect(() => {
    if (ref.current) {
      setState((draft) => {
        draft.canvasHeight = ref.current?.clientHeight ?? 0;
      });
    }
  }, [ref, setState]);

  useEffect(() => {
    scope.current = createScope({ root }).add((self) => {
      self!.add('scrollTo', (offset: number) => {
        animate(canvas.current!, {
          translateY: -offset,
          duration: 300,
          easing: 'easeInOutQuad',
        });
      });
    });

    return () => scope.current?.revert();
  }, [root, scope, canvas]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

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

  useEffect(
    () =>
      send({
        type: 'SET_TRACKS',
        tracks: tracks ?? [],
      }),
    [tracks, send],
  );

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
    <div
      ref={root}
      className="bg-background rounded-2xl w-screen h-screen flex flex-col overflow-hidden relative"
    >
      <div className="flex flex-row flex-1 gap-x-4 pr-10 pl-4 overflow-hidden">
        <aside className="w-14">
          <div className="h-20" />
          <div className="mt-8">
            <div className="rounded-full flex flex-col items-center justify-center gap-y-8 py-8 bg-black">
              <button
                className="h-6 w-6"
                onClick={() => {
                  setNav('home');

                  scrollTo(0);
                }}
              >
                <HomeIcon
                  size={24}
                  className={cn(
                    nav === 'home' ? 'text-white' : 'text-gray-400',
                  )}
                />
              </button>
              <button
                className="h-6 w-6"
                onClick={() => {
                  setNav('albums');

                  scrollTo(canvasHeight);
                }}
              >
                <Album
                  size={24}
                  className={cn(
                    nav === 'albums' ? 'text-white' : 'text-gray-400',
                  )}
                />
              </button>
              <button
                className="h-6 w-6"
                onClick={() => {
                  setNav('playlists');

                  scrollTo(canvasHeight * 2);
                }}
              >
                <ListMusic
                  size={24}
                  className={cn(
                    nav === 'playlists' ? 'text-white' : 'text-gray-400',
                  )}
                />
              </button>
              <button
                className="h-6 w-6"
                onClick={() => {
                  setNav('favorites');

                  scrollTo(canvasHeight * 3);
                }}
              >
                <Heart
                  size={24}
                  className={cn(
                    nav === 'favorites' ? 'text-white' : 'text-gray-400',
                  )}
                />
              </button>
              <button
                className="h-6 w-6"
                onClick={() => {
                  setNav('settings');

                  scrollTo(canvasHeight * 4);
                }}
              >
                <Settings
                  size={24}
                  className={cn(
                    nav === 'settings' ? 'text-white' : 'text-gray-400',
                  )}
                />
              </button>
            </div>
          </div>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="h-20"></header>
          <div ref={ref} className="relative flex-1 mt-8 overflow-hidden">
            <div
              ref={canvas}
              className="absolute top-0 left-0 right-0 bottom-0"
            >
              <TracksProvider value={tracksContext}>
                <Tracks style={{ height: canvasHeight }} />
              </TracksProvider>
              <div
                className="w-full bg-amber-600"
                style={{ height: canvasHeight }}
              />
              <div
                className="w-full bg-blue-600"
                style={{ height: canvasHeight }}
              />
              <div
                className="w-full bg-green-600"
                style={{ height: canvasHeight }}
              />
              <div
                className="w-full bg-purple-600"
                style={{ height: canvasHeight }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-32 pr-10 pl-4 bg-orange-50 flex flex-row items-center">
        <div className="w-14 mr-4">
          <audio
            ref={audio}
            onEnded={() => {
              const { loop } = context;

              send({ type: 'STOP' });

              if (loop !== 'none') {
                setTimeout(() => {
                  send({ type: 'PLAY_NEXT' });
                }, 100);
              }
            }}
            onTimeUpdate={(event) => {
              const currentTime = (event.target as HTMLAudioElement)
                .currentTime;

              send({ type: 'SET_TIME', time: currentTime });
            }}
          />
        </div>
        <div
          suppressHydrationWarning
          className="flex-1 flex flex-row items-center gap-x-4"
        >
          {track?.cover ? (
            <Image
              suppressHydrationWarning
              src={track.cover}
              alt="Cover"
              width={48}
              height={48}
              className="rounded-md"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-300 rounded-md" />
          )}
          <div className="flex flex-col flex-1 items-center">
            <div className="grid grid-cols-[2fr_6fr_2fr] items-center w-full">
              <div>
                <p className="text-base">
                  {track?.name ?? ''}
                  {track?.codec
                    ? `(${track.codec}_${formatSampleRate(track?.sampleRate)})`
                    : ''}
                </p>
                <p>{track?.artist ?? ''}</p>
              </div>
              <div className="flex flex-row items-center justify-center gap-x-4">
                <button className="w-10 h-10 flex flex-row items-center justify-center">
                  {track?.favorite === true ? (
                    <HeartPulse size={20} color="#FF0000" />
                  ) : (
                    <Heart size={20} color="#FF0000" />
                  )}
                </button>
                <button
                  className="w-10 h-10 flex flex-row items-center justify-center"
                  onClick={() => send({ type: 'PLAY_PREV' })}
                >
                  <SkipBack />
                </button>
                <button
                  className="w-10 h-10 flex flex-row items-center justify-center bg-orange-400 rounded-full"
                  onClick={() => send({ type: 'TOGGLE_PLAY' })}
                >
                  {snapshot?.value === 'playing' ? <Pause /> : <Play />}
                </button>
                <button
                  className="w-10 h-10 flex flex-row items-center justify-center"
                  onClick={() => send({ type: 'PLAY_NEXT' })}
                >
                  <SkipForward />
                </button>
                <button
                  className="w-10 h-10 flex flex-row items-center justify-center"
                  onClick={() => send({ type: 'SWITCH_LOOP' })}
                >
                  <Loop />
                </button>
              </div>
              <div className="flex flex-row items-center justify-end gap-x-4">
                <Volume />
                <Slider
                  className="flex-1"
                  value={[volume ?? 100]}
                  onValueChange={(value) =>
                    send({ type: 'SET_VOLUME', volume: value[0] })
                  }
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>
            <div className="flex flex-row items-center gap-x-4 mt-2 w-4/5">
              <p className="font-mono">
                {new Date((context?.time ?? 0) * 1000)
                  .toISOString()
                  .slice(14, 19)}
              </p>
              <Slider
                className="flex-1"
                value={[context?.time ?? 0]}
                onValueChange={(value) => {
                  send({ type: 'SET_TIME', time: value[0] });

                  if (audio.current) {
                    audio.current.currentTime = value[0];
                  }
                }}
                min={0}
                max={track?.duration ?? 0}
                step={1}
              />
              <p className="font-mono">
                {new Date((track?.duration ?? 0) * 1000)
                  .toISOString()
                  .slice(14, 19)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
