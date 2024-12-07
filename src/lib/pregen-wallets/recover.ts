import { AwsCredentialIdentity } from '@aws-sdk/types';
import { OnChainWallet } from '@custom-types/onchain-wallet';
import CryptoJS from 'crypto-js';
import AES from 'crypto-js/aes';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { Wallet } from 'ethers';
import { kmsDecryptQuery } from '@hooks/data/embedded/dkms/kms';

function decryptPrivateKeyWithCryptoJs(encryptedPrivateKeyBase64: string, plaintextDataKeyBase64: string) {
  const keyWordArray = Base64.parse(plaintextDataKeyBase64);
  const iv = CryptoJS.lib.WordArray.create(new Uint8Array(16));
  const decrypted = AES.decrypt(encryptedPrivateKeyBase64, keyWordArray, { iv });
  return decrypted.toString(Utf8);
}

export async function recoverPreGenWallet(
  encryptedDataKey: string,
  encryptedPrivateKeyBase64: string,
  credentials: AwsCredentialIdentity,
): Promise<OnChainWallet> {
  // Decrypt data key with KMS
  const rawDataKeyBase64 = await kmsDecryptQuery({
    credentials,
    decryptData: encryptedDataKey,
    formatOverride: 'base64',
  });
  // Decrypt mnemonic with raw data key
  const privateKey = decryptPrivateKeyWithCryptoJs(encryptedPrivateKeyBase64, rawDataKeyBase64);
  const { address } = new Wallet(privateKey);
  return {
    privateKey,
    address,
    mnemonic: '',
    HDWalletPath: '',
  };
}
