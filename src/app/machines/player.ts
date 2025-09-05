import { setup, assign } from 'xstate';

type PlayerStatus = 'playing' | 'paused' | 'stopped';

type PlayerContext = {
  status: PlayerStatus;
  track?: number;
  volume?: number;
  src?: string;
};

type PlayerEvents =
  | { type: 'PLAY'; src: string; track: number }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_PLAY' };

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
}).createMachine({
  id: 'player',
  initial: 'stopped',
  context: ({ input: { src, volume } }) => ({
    status: 'stopped',
    src,
    volume: volume ?? 100,
  }),
  states: {
    stopped: {
      on: {
        PLAY: {
          target: 'playing',
          actions: assign({
            status: () => 'playing',
            src: ({ event }) => event.src,
            track: ({ event }) => event.track,
          }),
        },
        SET_VOLUME: {
          actions: assign({
            volume: ({ event }) => event.volume,
          }),
        },
        TOGGLE_PLAY: {
          target: 'playing',
          actions: assign({
            status: () => 'playing',
          }),
        },
      },
    },
    playing: {
      on: {
        PLAY: {
          actions: assign({
            src: ({ event }) => event.src,
            status: () => 'playing',
          }),
        },
        PAUSE: {
          target: 'paused',
          actions: assign({
            status: () => 'paused',
          }),
        },
        STOP: {
          target: 'stopped',
          actions: assign({
            status: () => 'stopped',
          }),
        },
        SET_VOLUME: {
          actions: assign({
            volume: ({ event }) => event.volume,
          }),
        },
        TOGGLE_PLAY: {
          target: 'paused',
          actions: assign({
            status: () => 'paused',
          }),
        },
      },
    },
    paused: {
      on: {
        PLAY: {
          target: 'playing',
          actions: assign({
            status: () => 'playing',
          }),
        },
        STOP: {
          target: 'stopped',
          actions: assign({
            status: () => 'stopped',
          }),
        },
        SET_VOLUME: {
          actions: assign({
            volume: ({ event }) => event.volume,
          }),
        },
        TOGGLE_PLAY: {
          target: 'playing',
          actions: assign({
            status: () => 'playing',
          }),
        },
      },
    },
  },
});
