import { calcSampleRate } from './music';

describe('Test the music module', () => {
  it('calcSampleRate function', () => {
    expect(calcSampleRate(0, 0, 0)).toBe('0 Hz');
    expect(calcSampleRate(1_411_200, 16, 2)).toBe('44.1 kHz');
    expect(calcSampleRate(705_600, 16, 2)).toBe('22.1 kHz');
    expect(calcSampleRate(352_800, 16, 2)).toBe('11.0 kHz');
    expect(calcSampleRate(176_400, 16, 2)).toBe('5.5 kHz');
    expect(calcSampleRate(88_200, 16, 2)).toBe('2.8 kHz');
    expect(calcSampleRate(44_100, 16, 2)).toBe('1.4 kHz');
  });
});
