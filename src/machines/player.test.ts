import { createActor } from 'xstate';
import { describe, it, expect } from 'vitest';

import playerMachine from './player';

describe('Test the Player State Machine', () => {
  it('should have correct state', () => {
    const actor = createActor(playerMachine, {
      input: {},
    });

    actor.start();

    expect(actor.getSnapshot().value).toBe('stopped');

    actor.send({ type: 'PLAY' });

    expect(actor.getSnapshot().value).toBe('playing');
  });

  it('should set context correctly', () => {
    const actor = createActor(playerMachine, {
      input: {},
    });

    actor.start();

    actor.send({ type: 'SET_TRACK', id: 10 });

    expect(actor.getSnapshot().context.id).toBe(10);

    expect(actor.getSnapshot().context.volume).toBe(100);

    actor.send({ type: 'SET_VOLUME', volume: 50 });

    expect(actor.getSnapshot().context.volume).toBe(50);

    actor.send({ type: 'MUTE' });

    expect(actor.getSnapshot().context.volume).toBe(0);

    actor.send({ type: 'UNMUTE' });

    expect(actor.getSnapshot().context.volume).toBe(50);
  });
});
