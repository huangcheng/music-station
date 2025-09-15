import { setup, assign } from 'xstate';

import type { Music } from '@/types';

// type PlayerStatus = 'playing' | 'paused' | 'stopped';

type LoopMode = 'none' | 'one' | 'all' | 'shuffle';

type PlayerContext = {
  id?: number;
  tracks?: Music[];
  track?: Music;
  volume?: number;
  originalVolume?: number;
  loop?: LoopMode;
};

type PlayerEvents =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'PLAY_NEXT' }
  | { type: 'PLAY_PREV' }
  | { type: 'SET_TRACK'; id: number }
  | { type: 'SET_TRACKS'; tracks: Music[] }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'MUTE' }
  | { type: 'UNMUTE' }
  | { type: 'TOGGLE_MUTE' };

type PlayerInput = {
  volume?: number;
  loop?: LoopMode;
  tracks?: Music[];
};

export const playerMachine = setup({
  types: {
    context: {} as PlayerContext,
    events: {} as PlayerEvents,
    input: {} as PlayerInput,
  },
  actions: {
    toggleMute: assign(({ context }) => {
      return context.volume === 0
        ? {
            volume: context.originalVolume ?? 100,
          }
        : {
            volume: 0,
          };
    }),
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

      const currentIndex = tracks?.findIndex((t) => t.id === context.track?.id);

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

      return {
        track: tracks[prevIndex],
        id: tracks[prevIndex].id,
      };
    }),
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
        PLAY: {
          target: 'playing',
        },
        SET_VOLUME: {
          actions: assign(({ event: { volume } }) => ({
            volume: volume,
            originalVolume: volume,
          })),
        },
        SET_TRACKS: {
          actions: assign(({ event: { tracks } }) => ({
            tracks,
          })),
        },
        MUTE: {
          actions: assign({
            volume: 0,
          }),
        },
        TOGGLE_MUTE: {
          actions: [
            {
              type: 'toggleMute',
            },
          ],
        },
        UNMUTE: {
          actions: assign(({ context }) => ({
            volume: context.originalVolume ?? 100,
          })),
        },
        TOGGLE_PLAY: {
          target: 'playing',
        },
        PLAY_NEXT: {
          target: 'playing',
          actions: [
            {
              type: 'getNextTrack',
            },
          ],
        },
        PLAY_PREV: {
          target: 'playing',
          actions: [
            {
              type: 'getPrevTrack',
            },
          ],
        },
        SET_TRACK: {
          actions: assign(({ event: { id }, context: { tracks } }) => ({
            id,
            track: tracks?.find((t) => t.id === id),
          })),
        },
      },
    },
    playing: {
      on: {
        PLAY: {
          target: 'playing',
        },
        PAUSE: {
          target: 'paused',
        },
        STOP: {
          target: 'stopped',
        },
        SET_VOLUME: {
          actions: assign(({ event: { volume } }) => ({
            volume: volume,
            originalVolume: volume,
          })),
        },
        SET_TRACKS: {
          actions: assign(({ event: { tracks } }) => ({
            tracks,
          })),
        },
        TOGGLE_MUTE: {
          actions: [
            {
              type: 'toggleMute',
            },
          ],
        },
        TOGGLE_PLAY: {
          target: 'paused',
        },
        PLAY_NEXT: {
          target: 'playing',
          actions: [
            {
              type: 'getNextTrack',
            },
          ],
        },
        PLAY_PREV: {
          target: 'playing',
          actions: [
            {
              type: 'getPrevTrack',
            },
          ],
        },
        SET_TRACK: {
          actions: assign(({ event: { id }, context: { tracks } }) => ({
            id,
            track: tracks?.find((t) => t.id === id),
          })),
        },
      },
    },
    paused: {
      on: {
        PLAY: {
          target: 'playing',
        },
        STOP: {
          target: 'stopped',
        },
        SET_VOLUME: {
          actions: assign(({ event: { volume } }) => ({
            volume: volume,
            originalVolume: volume,
          })),
        },
        SET_TRACKS: {
          actions: assign(({ event: { tracks } }) => ({
            tracks,
          })),
        },
        TOGGLE_MUTE: {
          actions: [
            {
              type: 'toggleMute',
            },
          ],
        },
        TOGGLE_PLAY: {
          target: 'playing',
        },
        PLAY_NEXT: {
          target: 'playing',
          actions: [
            {
              type: 'getNextTrack',
            },
          ],
        },
        PLAY_PREV: {
          target: 'playing',
          actions: [
            {
              type: 'getPrevTrack',
            },
          ],
        },
        SET_TRACK: {
          actions: assign(({ event: { id }, context: { tracks } }) => ({
            id,
            track: tracks?.find((t) => t.id === id),
          })),
        },
      },
    },
  },
});
