/* istanbul ignore file */
import sigUtil, { EIP712LegacyData, EIP712TypedData } from 'eth-sig-util';
import { HDNodeWallet, Wallet, getAddress, getBytes, isHexString, keccak256, toUtf8Bytes, verifyMessage } from 'ethers';

function toChecksumAddress(address: string | null): string | null {
  if (address === null) return null;
  let checksumAddress: string | null;

  try {
    checksumAddress = getAddress(address);
  } catch {
    checksumAddress = null;
  }

  return checksumAddress;
}

function generateUserId(publicAddress: string | null) {
  return `did:ethr:${toChecksumAddress(publicAddress)}`;
}

const HDWalletPath = {
  // prettier-ignore

  path0: "m/44\'/60\'/0\'/0/0",
} as const;

function createEthWallet(mnemonic: string) {
  const { privateKey, address } = HDNodeWallet.fromPhrase(mnemonic, undefined, HDWalletPath.path0);

  return {
    privateKey,
    address,
    mnemonic,
    HDWalletPath: HDWalletPath.path0,
  };
}

const EMPTY_SIGNATURE = '0x0';
export function personalSign(message: string, privateKey: string | null, isRetry: boolean = false) {
  try {
    if (privateKey) {
      const buffer = Buffer.from(privateKey.substring(2), 'hex');
      return sigUtil.personalSign(buffer, { data: message });
    }
  } catch (e) {
    // if length is 88, there's a good chance the PK was encoded twice, so we run the
    // function again so it's decoded a second time.
    if (privateKey?.length === 88 && !isRetry) {
      logger.warn('Retrying personalSign, key might be double encoded', {
        privateKey: { exists: !!privateKey, type: typeof privateKey, length: privateKey?.length },
      });
      return personalSign(message, privateKey, true);
    }
    // !!Critical, don't log plain text private key!!
    logger.error('Personal Sign failure!', {
      privateKey: { exists: !!privateKey, type: typeof privateKey, length: privateKey?.length },
    });
    throw e;
  } finally {
    // Mark the private key variable for garbage collection.
    privateKey = null;
  }

  return EMPTY_SIGNATURE;
}

function legacyHashMessage(message: string) {
  const prefix = `\x19Ethereum Signed Message:\n${message.length}`;
  return keccak256(toUtf8Bytes(prefix + message));
}

async function ethSign(message: string, privateKey: string) {
  const wallet = new Wallet(privateKey);
  let signature;
  if (isHexString(message)) {
    const messageBuffer = getBytes(message);
    signature = await wallet.signMessage(messageBuffer);
  } else {
    const hash = legacyHashMessage(message);
    signature = await wallet.signMessage(getBytes(hash));
  }
  return signature;
}

function signTypedDataV1(typedData: EIP712LegacyData, privateKey: string | null) {
  if (privateKey) {
    const buffer = Buffer.from(privateKey.substring(2), 'hex');
    const signature = sigUtil.signTypedDataLegacy(buffer, { data: typedData });
    privateKey = null;
    return signature;
  }
  return EMPTY_SIGNATURE;
}

function signTypedDataV3(typedData: EIP712TypedData, privateKey: string | null) {
  if (privateKey) {
    const buffer = Buffer.from(privateKey.substring(2), 'hex');
    const signature = sigUtil.signTypedData(buffer, { data: typedData });
    privateKey = null;
    return signature;
  }
  return EMPTY_SIGNATURE;
}

function signTypedDataV4(typedData: EIP712TypedData, privateKey: string | null) {
  if (privateKey) {
    const buffer = Buffer.from(privateKey.substring(2), 'hex');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signature = (sigUtil as any).signTypedData_v4(buffer, { data: typedData });
    privateKey = null;
    return signature;
  }
  return EMPTY_SIGNATURE;
}

const SynchronousWeb3Operations = {
  toChecksumAddress,
  generateUserId,
  createEthWallet,
  personalSign,
  signTypedDataV1,
  signTypedDataV3,
  signTypedDataV4,
  ethSign,
  verifyMessage,
};

export default SynchronousWeb3Operations;
