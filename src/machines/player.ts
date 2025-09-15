import { setup, assign } from 'xstate';

type PlayerStatus = 'playing' | 'paused' | 'stopped';

type PlayerContext = {
  id?: number;
  status: PlayerStatus;
  track?: number;
  volume?: number;
  src?: string;
  originalVolume?: number;
};

type PlayerEvents =
  | { type: 'PLAY'; src: string; id: number }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'MUTE' }
  | { type: 'UNMUTE' }
  | { type: 'TOGGLE_MUTE' };

type PlayerInput = {
  src?: string;
  volume?: number;
};

export const playerMachine = setup({
  types: {
    context: {
      status: 'stopped' as PlayerStatus,
    } as PlayerContext,
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
  },
}).createMachine({
  id: 'player',
  initial: 'stopped',
  context: ({ input: { src, volume } }) => ({
    status: 'stopped',
    src: src ?? '',
    volume: volume ?? 100,
  }),
  states: {
    stopped: {
      on: {
        PLAY: {
          target: 'playing',
          actions: assign(({ event: { id, src } }) => ({
            status: 'playing',
            src,
            id,
          })),
        },
        SET_VOLUME: {
          actions: assign(({ event: { volume } }) => ({
            volume: volume,
            originalVolume: volume,
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
          actions: assign({
            status: 'playing',
          }),
        },
      },
    },
    playing: {
      on: {
        PLAY: {
          target: 'playing',
          actions: assign(({ event: { id, src } }) => ({
            status: 'playing',
            src,
            id,
          })),
        },
        PAUSE: {
          target: 'paused',
          actions: assign({
            status: 'paused',
          }),
        },
        STOP: {
          target: 'stopped',
          actions: assign({
            status: 'stopped',
          }),
        },
        SET_VOLUME: {
          actions: assign(({ event: { volume } }) => ({
            volume: volume,
            originalVolume: volume,
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
          actions: assign({
            status: 'paused',
          }),
        },
      },
    },
    paused: {
      on: {
        PLAY: {
          target: 'playing',
          actions: assign({
            status: 'playing',
          }),
        },
        STOP: {
          target: 'stopped',
          actions: assign({
            status: 'stopped',
          }),
        },
        SET_VOLUME: {
          actions: assign(({ event: { volume } }) => ({
            volume: volume,
            originalVolume: volume,
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
          actions: assign({
            status: 'playing',
          }),
        },
      },
    },
  },
});
