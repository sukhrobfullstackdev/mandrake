import { AwsCredentialIdentity } from '@aws-sdk/types';
import { DelegatedWalletInfo } from '@custom-types/api-response';

export type KmsDecryptQueryKey = ReturnType<typeof kmsQueryKeys.kmsDecrypt>;
export type KmsEncryptQueryKey = ReturnType<typeof kmsQueryKeys.kmsEncrypt>;

export type KmsDecryptParams = {
  credentials: AwsCredentialIdentity;
  decryptData: string;
  formatOverride?: BufferEncoding;
};

export type KmsEncryptParams = {
  credentials: AwsCredentialIdentity;
  encryptData: string;
  delegatedWalletInfo: DelegatedWalletInfo;
};

export const kmsQueryKeys = {
  base: ['kms'] as const,

  kmsDecrypt: (params: KmsDecryptParams) => [[...kmsQueryKeys.base, 'kms-decrypt'], params] as const,

  kmsEncrypt: (params: KmsEncryptParams) => [[...kmsQueryKeys.base, 'kms-encrypt'], params] as const,
};
