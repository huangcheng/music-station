import { setup, assign, fromPromise } from 'xstate';

import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

import { updateTrack$ } from '@/hooks';

type FavoriteContext = {
  /**
   * The ID of the item to be favorite or unfavored.
   */
  id: number;
  favorite?: boolean;
};

type FavoriteEvents = { type: 'TOGGLE' } | { type: 'SYNC'; favorite: boolean };

type FavoriteInput = {
  id: number;
};

type FavoriteParams = {
  id: number;
  favorite: boolean;
};

const favoriteMachine = setup({
  types: {
    context: {} as FavoriteContext,
    events: {} as FavoriteEvents,
    input: {} as FavoriteInput,
  },
  guards: {
    favorite: ({ context: { favorite } }: { context: FavoriteContext }) =>
      favorite === true,
  },
  actors: {
    updateFavorite: fromPromise<boolean, FavoriteParams>(
      async ({ input: { id, favorite } }) => {
        const ob$ = updateTrack$(id, { favorite }).pipe(
          map(({ favorite }) => favorite),
        );

        return await lastValueFrom(ob$);
      },
    ),
  },
}).createMachine({
  id: 'favorite',
  initial: 'decide',
  context: ({ input: { id } }) => ({
    id,
  }),
  states: {
    decide: {
      tags: ['pending'],
      always: [
        {
          target: 'favorite',
          guard: 'favorite',
        },
        { target: 'unfavored' },
      ],
    },
    processing: {
      tags: ['pending'],
      invoke: {
        src: 'updateFavorite',
        input: ({
          context: { id, favorite },
        }: {
          context: FavoriteContext;
        }) => ({
          id,
          favorite: !favorite,
        }),
        onDone: {
          target: 'decide',
          actions: assign({
            favorite: ({ event: { output } }) => output,
          }),
        },
        onError: { target: 'decide' },
      },
    },
    favorite: {
      on: {
        TOGGLE: 'processing',
      },
      tags: ['favorite'],
    },
    unfavored: {
      on: {
        TOGGLE: 'processing',
      },
      tags: ['unfavored'],
    },
  },
  on: {
    SYNC: {
      target: '.decide',
      actions: assign({
        favorite: ({ event: { favorite } }) => favorite ?? false,
      }),
    },
  },
});

export default favoriteMachine;
