import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { AWS_KMS_REGION } from '@constants/kms';
import { base64BinaryToUint8Array } from '@utils/base64';

export async function kmsDecrypt(
  credentials: AwsCredentialIdentity,
  decryptData?: string,
  formatOverride = 'ascii' as BufferEncoding,
) {
  logger.info('DKMS - Reconstructing secret');
  const kms = new KMSClient({
    region: AWS_KMS_REGION,
    credentials,
  });

  const decryptCommand = new DecryptCommand({
    CiphertextBlob: base64BinaryToUint8Array(decryptData),
  });

  const result = await kms.send(decryptCommand);

  if (!result.Plaintext) {
    throw new Error('DKMS - Failed decryption');
  }

  return Buffer.from(result.Plaintext).toString(formatOverride);
}
