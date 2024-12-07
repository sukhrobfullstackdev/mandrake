import { OnChainWallet } from '@custom-types/onchain-wallet';
import { isEmpty } from '@utils/is-empty';
import * as bip39 from 'bip39';
import { EIP712LegacyData, EIP712TypedData } from 'eth-sig-util';
import SynchronousWeb3Operations from '../synchronous-web3-operations';

function createEthWallet(): Promise<OnChainWallet> {
  const mnemonic = bip39.generateMnemonic();
  return Promise.resolve(SynchronousWeb3Operations.createEthWallet(mnemonic));
}

function personalSign(message: string, privateKey: string): Promise<string> {
  return Promise.resolve(SynchronousWeb3Operations.personalSign(message, privateKey));
}

function toChecksumAddress(address: string | null): Promise<string> {
  return Promise.resolve(SynchronousWeb3Operations.toChecksumAddress(address) || '');
}

function verifyMessage(message: string, signature: string) {
  return Promise.resolve(SynchronousWeb3Operations.verifyMessage(message, signature) || '');
}

async function compareAddresses(addresses: (string | undefined)[]) {
  if (isEmpty(addresses)) return false;
  const checksums = await Promise.all(addresses.map(addr => toChecksumAddress(addr || '0x0')));
  return checksums.every(addr => addr === checksums[0]);
}

function ethSign(message: string, privateKey: string) {
  return Promise.resolve(SynchronousWeb3Operations.ethSign(message, privateKey) || '');
}

function signTypedDataV4(message: EIP712TypedData, privateKey: string) {
  return Promise.resolve(SynchronousWeb3Operations.signTypedDataV4(message, privateKey) || '');
}

function signTypedDataV3(message: EIP712TypedData, privateKey: string) {
  return Promise.resolve(SynchronousWeb3Operations.signTypedDataV3(message, privateKey) || '');
}

function signTypedDataV1(message: EIP712LegacyData, privateKey: string) {
  return Promise.resolve(SynchronousWeb3Operations.signTypedDataV1(message, privateKey) || '');
}

const Web3Service = {
  createEthWallet,
  personalSign,
  ethSign,
  signTypedDataV4,
  signTypedDataV3,
  signTypedDataV1,
  toChecksumAddress,
  verifyMessage,
  compareAddresses,
};

export default Web3Service;
