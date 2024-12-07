import { AwsCredentialIdentity } from '@aws-sdk/types';
import { kmsDecryptQuery } from '@hooks/data/embedded/dkms/kms';

// Secret management strategies can be injected here.
export const reconstructSecret = (
  credentials: AwsCredentialIdentity,
  encryptedSecret: string,
  formatOverride: BufferEncoding = 'ascii' as BufferEncoding,
) => {
  logger.info('DKMS - Reconstructing secret');

  return kmsDecryptQuery({ credentials, decryptData: encryptedSecret, formatOverride });
};
