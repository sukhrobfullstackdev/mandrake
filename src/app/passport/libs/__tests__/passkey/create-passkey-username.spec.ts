import { createPasskeyUsername } from '@app/passport/libs/passkey/create-passkey-username';

describe('Create Passkey Username', () => {
  it('Passkey Username should contain Magic Passport', () => {
    const result = createPasskeyUsername();
    expect(result).toContain('Magic Passport');
  });
});
