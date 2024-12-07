import { AWS_KMS_REGION } from '@constants/kms';
import { type QueryFunction } from '@tanstack/react-query';
import { DecryptCommand, EncryptCommand, KMSClient, KMSServiceException } from '@aws-sdk/client-kms';
import { base64BinaryToUint8Array } from '@utils/base64';
import { KmsDecryptQueryKey, KmsEncryptQueryKey } from '@hooks/data/embedded/dkms/kms/keys';
import { logAwsErrorMessage, KmsServiceType } from '@lib/dkms/log-aws-error-message';

export const makeKmsDecryptFetcher =
  (): QueryFunction<string, KmsDecryptQueryKey> =>
  async ({ queryKey: [, { credentials, decryptData, formatOverride = 'ascii' as BufferEncoding }] }) => {
    const kms = new KMSClient({
      region: AWS_KMS_REGION,
      credentials,
    });

    const decryptCommand = new DecryptCommand({
      CiphertextBlob: base64BinaryToUint8Array(decryptData),
    });

    try {
      const result = await kms.send(decryptCommand);

      if (!result.Plaintext) {
        throw new Error('DKMS - Failed decryption');
      }

      return Buffer.from(result.Plaintext).toString(formatOverride);
    } catch (e) {
      const err = e as KMSServiceException;
      logAwsErrorMessage(err, KmsServiceType.KMSDecrypt);

      throw e;
    }
  };

export const makeKmsEncryptFetcher =
  (): QueryFunction<string, KmsEncryptQueryKey> =>
  async ({ queryKey: [, { credentials, encryptData, delegatedWalletInfo }] }) => {
    const kms = new KMSClient({
      region: AWS_KMS_REGION,
      credentials,
    });

    const encryptCommand = new EncryptCommand({
      KeyId: delegatedWalletInfo.delegatedKeyId,
      Plaintext: Buffer.from(encryptData),
    });

    try {
      const result = await kms.send(encryptCommand);

      if (!result.CiphertextBlob) {
        throw new Error('DKMS - Failed encryption');
      }

      return Buffer.from(result.CiphertextBlob).toString('base64');
    } catch (e) {
      const err = e as KMSServiceException;
      logAwsErrorMessage(err, KmsServiceType.KMSEncrypt);

      throw e;
    }
  };
