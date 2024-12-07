import { AwsCredentialIdentity } from '@aws-sdk/types';
import { kmsDecryptQuery } from '@hooks/data/embedded/dkms/kms';

const awsClientKmsSend = jest.fn();

jest.mock('@aws-sdk/client-kms', () => ({
  KMSClient: jest.fn().mockImplementation(() => ({ send: awsClientKmsSend })),
  EncryptCommand: jest.fn(),
  DecryptCommand: jest.fn(),
}));

const dataToDecrypt = 'secret';

const awsCredentials = {
  accessKeyId: 'string',
  secretAccessKey: 'string',
  sessionToken: 'string',
  credentialScope: 'string',
} as AwsCredentialIdentity;

describe('KMS - Decrypt', () => {
  beforeAll(() => {
    jest.resetModules(); // Reset cache
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the decrypted string', async () => {
    awsClientKmsSend.mockResolvedValue({ Plaintext: 'credential' });
    const encryption = await kmsDecryptQuery({
      credentials: awsCredentials,
      decryptData: dataToDecrypt,
      formatOverride: 'ascii',
    });

    expect(encryption).toBe('credential');
    awsClientKmsSend.mockReset();
  });

  it('should throw an error when the decryption fails', async () => {
    awsClientKmsSend.mockResolvedValue({});
    try {
      await kmsDecryptQuery(
        { credentials: awsCredentials, decryptData: dataToDecrypt, formatOverride: 'ascii' },
        { retry: false },
      );
    } catch (e) {
      expect((e as Error).message).toBe('DKMS - Failed decryption');
    }
  });
});
