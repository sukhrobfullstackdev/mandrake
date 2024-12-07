import { decodeBase64 } from '@lib/utils/base64';
import { isTctTokenInvalidOrExpired } from '@lib/utils/tct';
import { importSPKI, jwtVerify } from 'jose';

jest.mock('jose', () => ({
  importSPKI: jest.fn(),
  jwtVerify: jest.fn(),
}));

jest.mock('@lib/utils/base64', () => ({
  decodeBase64: jest.fn(),
}));

jest.mock('@constants/confirm-action-keys', () => ({
  CONFIRM_ACTION_JWT_PUBLIC_KEYS: {
    dev: 'devPublicKey',
    prod: 'prodPublicKey',
  },
}));

jest.mock('@constants/env', () => ({
  DEPLOY_ENV: 'dev',
}));

describe('isTctTokenInvalidOrExpired', () => {
  const validTct = 'header.payload.signature';
  const expiredTct = 'header.expiredPayload.signature';

  beforeEach(() => {
    (decodeBase64 as jest.Mock).mockImplementation((input: string) => {
      if (input === 'payload') {
        return JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }); // expires in 1 hour
      } else if (input === 'expiredPayload') {
        return JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 }); // expired 1 hour ago
      }
      return '';
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if the token is expired', async () => {
    const result = await isTctTokenInvalidOrExpired(expiredTct);
    expect(result).toBe(true);
  });

  it('should return true if jwtVerify fails', async () => {
    (importSPKI as jest.Mock).mockResolvedValue('publicKey');
    (jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    const result = await isTctTokenInvalidOrExpired(validTct);
    expect(result).toBe(true);
  });

  it('should return false if the token is valid and not expired', async () => {
    (importSPKI as jest.Mock).mockResolvedValue('publicKey');
    (jwtVerify as jest.Mock).mockResolvedValue(true);

    const result = await isTctTokenInvalidOrExpired(validTct);
    expect(result).toBe(false);
  });
});
