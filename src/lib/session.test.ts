import { vi, describe, it, expect } from 'vitest';
import { omit } from 'es-toolkit';

import { encrypt, decrypt } from './session';

vi.mock('server-only', () => {
  return {};
});

describe('Session Encryption and Decryption', () => {
  const testPayload = {
    id: 1,
    expires: new Date(Date.now() + 3_600_000).toISOString(),
  };

  it('should encrypt and decrypt a session payload correctly', async () => {
    const encrypted = await encrypt(testPayload);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toBe(JSON.stringify(testPayload));

    const decrypted = await decrypt(encrypted);
    expect(decrypted).not.toBeUndefined();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(omit(decrypted, ['iat', 'exp'])).toEqual(testPayload);
  });

  it('should return undefined when decrypting an invalid token', async () => {
    const decrypted = await decrypt('invalid-token');
    expect(decrypted).toBeUndefined();
  });

  it('should return undefined when decrypting an empty string', async () => {
    const decrypted = await decrypt('');
    expect(decrypted).toBeUndefined();
  });
});
