import { getStrSize, formatFileSize } from './utils';

describe('Test the utils module', () => {
  test('getStrSize returns correct size for a string', () => {
    expect(getStrSize('foo')).toBe(3);
    expect(getStrSize('')).toBe(0);
    expect(getStrSize('こんにちは')).toBe(15);
    expect(getStrSize('你好，世界!')).toBe(16);
  });

  test('formatFileSize returns correct size for a string', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(500)).toBe('500 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1_048_576)).toBe('1 MB');
    expect(formatFileSize(1_073_741_824)).toBe('1 GB');
    expect(formatFileSize(123_456_789)).toBe('117.74 MB');
  });
});
