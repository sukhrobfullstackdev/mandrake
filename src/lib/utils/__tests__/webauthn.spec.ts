import { transformCredentialCreateOptions, transformCredentialRequestOptions } from '../webauthn';

jest.mock('../base64', () => ({
  decodeBase64: jest.fn(input => atob(input)),
}));

describe('Credential Transformation Utilities', () => {
  describe('transformCredentialCreateOptions', () => {
    it('transforms challenge and user ID from base64 to Uint8Array', () => {
      const mockInput = {
        challenge: 'Y2hhbGxlbmdl', // base64 of 'challenge'
        user: {
          id: 'dXNlcmlk', // base64 of 'userid'
          name: 'testuser',
          displayName: 'Test User',
        },
      };

      const output = transformCredentialCreateOptions(mockInput);
      expect(output).toEqual({
        challenge: expect.any(Uint8Array),
        user: expect.objectContaining({
          id: expect.any(Uint8Array),
          name: 'testuser',
          displayName: 'Test User',
        }),
      });

      // Check if the Uint8Array contains the correct data
      expect([...output.challenge]).toEqual([...Uint8Array.from('challenge'.split('').map(c => c.charCodeAt(0)))]);
      expect([...output.user.id]).toEqual([...Uint8Array.from('userid'.split('').map(c => c.charCodeAt(0)))]);
    });

    it('handles incomplete input gracefully', () => {
      const incompleteInput = {
        challenge: 'Y2hhbGxlbmdl',
      };

      const output = transformCredentialCreateOptions(incompleteInput as any);
      expect(output.challenge).toEqual(expect.any(Uint8Array));
      expect(output.user).toEqual({ id: '' });
    });
  });

  describe('transformCredentialRequestOptions', () => {
    it('transforms challenge and credential IDs', () => {
      const requestOptions = {
        challenge: 'Y2hhbGxlbmdl',
        allowCredentials: [{ id: 'Y3JlZGVudGlhbGlk', type: 'public-key' }],
      };

      const output = transformCredentialRequestOptions(requestOptions);
      expect(output.challenge).toEqual(expect.any(Uint8Array));
      expect(output.allowCredentials[0].id).toEqual(expect.any(Uint8Array));
      expect([...output.challenge]).toEqual([...Uint8Array.from('challenge'.split('').map(c => c.charCodeAt(0)))]);
      expect([...output.allowCredentials[0].id]).toEqual([
        ...Uint8Array.from('credentialid'.split('').map(c => c.charCodeAt(0))),
      ]);
    });
  });
});
