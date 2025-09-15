'use client';

import { useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useImmer } from 'use-immer';
import { fromEvent } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { useObservable, useSubscription } from 'observable-hooks';
import { useMachine } from '@xstate/react';
import { createScope, animate } from 'animejs';
import { useShallow } from 'zustand/react/shallow';
import {
  Home as HomeIcon,
  Album,
  Heart,
  ListMusic,
  Settings,
} from 'lucide-react';

import type { ReactElement } from 'react';
import type { Scope } from 'animejs';

import { cn } from '@/lib';
import { useMediaStore } from '@/stores';
import { playerMachine } from '@/machines';

import { Tracks } from './_components';

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
    useShallow(({ fetch, tracks }) => ({ fetch, tracks })),
  );

  const [snapshot, send] = useMachine(playerMachine, {
    input: {
      tracks,
    },
  });

  const [state, setState] = useImmer<State>({
    nav: 'home',
    canvasHeight: 0,
    canvasOffset: 0,
  });

  const { nav, canvasHeight } = state;

  const { context } = snapshot;

  const { track } = context;

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

  const playback$ = useObservable(
    (inputs$) =>
      inputs$.pipe(
        switchMap(([audio, context, send]) =>
          fromEvent(audio.current!, 'ended').pipe(
            tap(() => {
              const { loop } = context;

              send({ type: 'STOP' });

              if (loop !== 'none') {
                send({ type: 'PLAY_NEXT' });
              }
            }),
          ),
        ),
      ),
    [audio, context, send],
  );

  useSubscription(playback$);

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
    const { volume } = context;

    if (audio.current && volume !== undefined && volume >= 0) {
      audio.current.volume = Math.min(volume / 100, 1);
    }
  }, [audio, context]);

  useEffect(() => {
    const { track } = context;

    if (audio.current && track?.file !== undefined) {
      audio.current.src = track.file;
    }
  }, [audio, context]);

  useEffect(
    () =>
      send({
        type: 'SET_TRACKS',
        tracks: tracks ?? [],
      }),
    [tracks, send],
  );

  useEffect(() => {
    const { value } = snapshot;

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
  }, [audio, snapshot]);

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
              <Tracks
                style={{ height: canvasHeight }}
                onClick={(id) => {
                  send({
                    type: 'SET_TRACK',
                    id,
                  });

                  send({
                    type: 'PLAY',
                  });
                }}
              />
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
          <audio ref={audio} controls />
        </div>
        <div className="flex-1">
          {track?.cover ? (
            <Image
              src={track.cover}
              alt="Cover"
              width={48}
              height={48}
              className="rounded-md"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-300 rounded-md" />
          )}
        </div>
      </div>
    </div>
  );
}
