import { convertToMS } from './time';

describe('Test time module', () => {
  test('Convert to MM:SS format', () => {
    const cases = [
      { input: 0, expected: '00:00' },
      { input: 5, expected: '00:05' },
      { input: 65, expected: '01:05' },
      { input: 600, expected: '10:00' },
      { input: 3599, expected: '59:59' },
      { input: 3600, expected: '60:00' },
      { input: 3661, expected: '61:01' },
    ];

    for (const { input, expected } of cases) {
      const result = convertToMS(input);
      expect(result).toBe(expected);
    }
  });
});
