import { of, lastValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { setup, assign, fromPromise, stopChild } from 'xstate';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import type { Track, LoopMode } from '@/types';

import { updateTrack$ } from '@/hooks';

dayjs.extend(utc);

const updateRecentlyPlayedActor = fromPromise(
  async ({ input: { id } }: { input: { id: number } }): Promise<boolean> => {
    const timestamp = dayjs().utc().unix();

    const ob$ = updateTrack$(id, {
      recentlyPlayed: timestamp,
    }).pipe(
      map(() => true),
      catchError(() => of(false)),
    );

    return await lastValueFrom(ob$);
  },
);

export type PlayerContext = {
  id?: number;
  tracks?: Track[];
  track?: Track;
  volume?: number;
  originalVolume?: number;
  loop?: LoopMode;
  time?: number;
  updateRecentlyPlayedActorRef?: unknown;
};

type PlayerEvents =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'PLAY_NEXT' }
  | { type: 'PLAY_PREV' }
  | { type: 'SET_TRACK'; id: number }
  | { type: 'SET_TRACKS'; tracks: Track[] }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'MUTE' }
  | { type: 'UNMUTE' }
  | { type: 'SWITCH_LOOP' }
  | { type: 'SET_TIME'; time: number }
  | { type: 'TOGGLE_MUTE' };

type PlayerInput = {
  volume?: number;
  loop?: LoopMode;
  tracks?: Track[];
};

const playerMachine = setup({
  types: {
    context: {} as PlayerContext,
    events: {} as PlayerEvents,
    input: {} as PlayerInput,
  },
  actions: {
    toggleMute: assign(({ context }) =>
      context.volume === 0
        ? { volume: context.originalVolume ?? 100 }
        : { volume: 0 },
    ),
    setVolume: assign((_, { volume }: { volume: number }) => ({
      volume,
      originalVolume: volume,
    })),
    mute: assign({
      volume: 0,
    }),
    unmute: assign(({ context }) => ({
      volume: context.originalVolume ?? 100,
    })),
    setTrack: assign(({ context }, { id }: { id: number }) => ({
      id,
      track: context.tracks?.find((t) => t.id === id),
    })),
    getNextTrack: assign(({ context }: { context: PlayerContext }) => {
      const { loop, tracks } = context;

      if (!tracks || tracks.length === 0) {
        return {};
      }

      const currentIndex = tracks.findIndex((t) => t.id === context.track?.id);

      if (!loop && currentIndex === tracks.length - 1) {
        return {};
      }

      let nextIndex = currentIndex;

      switch (loop) {
        case 'one': {
          nextIndex = currentIndex;
          break;
        }
        case 'all': {
          nextIndex = (currentIndex + 1) % tracks.length;
          break;
        }
        case 'shuffle': {
          nextIndex = Math.floor(Math.random() * tracks.length);
          break;
        }
      }

      if (loop === 'shuffle' && nextIndex === currentIndex) {
        nextIndex = (currentIndex + 1) % tracks.length;
      }

      return {
        track: tracks[nextIndex],
        id: tracks[nextIndex].id,
      };
    }),
    getPrevTrack: assign(({ context }: { context: PlayerContext }) => {
      const { loop, tracks } = context;

      if (!tracks || tracks.length === 0) {
        return {};
      }

      const currentIndex = tracks.findIndex((t) => t.id === context.track?.id);

      if (!loop && currentIndex === 0) {
        return {};
      }

      let prevIndex = currentIndex;

      switch (loop) {
        case 'one': {
          prevIndex = currentIndex;
          break;
        }
        case 'all': {
          prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
          break;
        }
        case 'shuffle': {
          prevIndex = Math.floor(Math.random() * tracks.length);
          break;
        }
      }

      if (loop === 'shuffle' && prevIndex === currentIndex) {
        prevIndex = (currentIndex + 1) % tracks.length;
      }

      return {
        track: tracks[prevIndex],
        id: tracks[prevIndex].id,
      };
    }),
    switchLoop: assign(({ context: { loop } }): { loop: LoopMode } => {
      const modes: LoopMode[] = ['none', 'one', 'all', 'shuffle'];

      if (loop === undefined) {
        return { loop: 'none' };
      }

      const index = modes.indexOf(loop);
      const nextIndex = (index + 1) % modes.length;

      return { loop: modes[nextIndex] as unknown as LoopMode };
    }),
    setTime: assign((_, { time }: { time: number }) => ({
      time,
    })),
  },
}).createMachine({
  id: 'player',
  initial: 'stopped',
  context: ({ input: { volume, tracks, loop } }) => ({
    status: 'stopped',
    volume: volume ?? 100,
    loop: loop ?? 'all',
    tracks: tracks ?? [],
  }),
  states: {
    stopped: {
      on: {
        PLAY: { target: 'playing' },
        TOGGLE_PLAY: {
          target: 'playing',
        },
      },
    },
    playing: {
      entry: [
        assign({
          updateRecentlyPlayedActorRef: ({ context: { id }, spawn }) =>
            spawn<typeof updateRecentlyPlayedActor>(updateRecentlyPlayedActor, {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              id: 'child-update-recently-played',
              input: { id: id as number },
            }),
        }),
      ],
      exit: [
        stopChild('child-update-recently-played'),
        assign({ updateRecentlyPlayedActorRef: undefined }),
      ],
      on: {
        PLAY: { target: 'playing' },
        PAUSE: { target: 'paused' },
        STOP: { target: 'stopped' },
        SET_VOLUME: {
          actions: [
            {
              type: 'setVolume',
              params: ({ event: { volume } }) => ({ volume }),
            },
          ],
        },
        TOGGLE_PLAY: { target: 'paused' },
      },
    },
    paused: {
      on: {
        PLAY: { target: 'playing' },
        STOP: { target: 'stopped' },
        TOGGLE_PLAY: { target: 'playing' },
      },
    },
  },
  on: {
    SET_VOLUME: {
      actions: [
        {
          type: 'setVolume',
          params: ({ event: { volume } }) => ({ volume }),
        },
      ],
    },
    SET_TRACKS: {
      actions: assign(({ event: { tracks } }) => ({ tracks })),
    },
    MUTE: {
      actions: [{ type: 'mute' }],
    },
    TOGGLE_MUTE: {
      actions: [{ type: 'toggleMute' }],
    },
    UNMUTE: {
      actions: [{ type: 'unmute' }],
    },
    PLAY_NEXT: {
      target: '.playing',
      actions: [{ type: 'getNextTrack' }],
    },
    PLAY_PREV: {
      target: '.playing',
      actions: [{ type: 'getPrevTrack' }],
    },
    SET_TRACK: {
      actions: [
        {
          type: 'setTrack',
          params: ({ event: { id } }) => ({ id }),
        },
      ],
    },
    SWITCH_LOOP: {
      actions: [
        {
          type: 'switchLoop',
        },
      ],
    },
    SET_TIME: {
      actions: [
        {
          type: 'setTime',
          params: ({ event: { time } }) => ({ time }),
        },
      ],
    },
  },
});

export default playerMachine;
