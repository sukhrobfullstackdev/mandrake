import { AwsCredentialIdentity } from '@aws-sdk/types';
import { kmsEncryptQuery } from '@hooks/data/embedded/dkms/kms';

jest.mock('@aws-sdk/client-cognito-identity', () => ({
  CognitoIdentityClient: jest.fn(),
  GetIdCommand: jest.fn(),
  GetCredentialsForIdentityCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-kms', () => ({
  KMSClient: jest.fn().mockImplementation(() => ({ send: jest.fn().mockResolvedValue({ CiphertextBlob: 'string' }) })),
  EncryptCommand: jest.fn(),
  DecryptCommand: jest.fn(),
}));

const awsCredentials = {
  accessKeyId: 'string',
  secretAccessKey: 'string',
  sessionToken: 'string',
  credentialScope: 'string',
} as AwsCredentialIdentity;

const encryptData = 'secret';

const delegatedWalletInfo = {
  delegatedAccessToken: 'access_token',
  delegatedIdentityId: 'identity_id',
  delegatedKeyId: 'key_id',
  delegatedPoolId: 'pool_id',
  shouldCreateDelegatedWallet: true,
};

describe('KMS Encrypt', () => {
  beforeAll(() => {
    jest.resetModules(); // Reset cache
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an encrypted string', async () => {
    const encryptionResult = await kmsEncryptQuery({ credentials: awsCredentials, encryptData, delegatedWalletInfo });

    expect(encryptionResult).toBe('c3RyaW5n');
  });
});
