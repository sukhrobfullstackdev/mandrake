import { ConnectedWallet, KadenaSignedTransaction } from '@custom-types/kadena';
import { OnChainWallet } from '@custom-types/onchain-wallet';

export interface SolanaLedgerBridge extends ILedgerBridge {
  signMessage: (payload: unknown, pk: string) => Promise<unknown>;
  signTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  sendTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  sendPartialTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  partialSignTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  convertMnemonicToRawPrivateKey: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface HederaLedgerBridge extends ILedgerBridge {
  getPublicKey: (payload: unknown, pk: string) => Promise<unknown>;
  sign: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface SuiLedgerBridge extends ILedgerBridge {
  signAndSendTransaction: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface BtcLedgerBridge extends ILedgerBridge {
  signTransaction: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface CfxLedgerBridge extends ILedgerBridge {
  sendTransaction: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface CosmosLedgerBridge extends ILedgerBridge {
  sign: (payload: unknown, pk: string) => Promise<unknown>;
  sendTokens: (payload: unknown, pk: string) => Promise<unknown>;
  signAndBroadcast: (payload: unknown, pk: string) => Promise<unknown>;
  changeAddress: (payload: unknown, pk: string) => Promise<unknown>;
  signTypedData: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface FlowLedgerBridge extends ILedgerBridge {
  getUsdcBalance: (payload: unknown) => Promise<unknown>;
  getAccount: (payload: unknown, pk: string) => Promise<unknown>;
  signTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  signMessage: (payload: unknown, pk: string) => Promise<unknown>;
  composeSendFlow: (payload: unknown, pk: string) => Promise<unknown>;
  composeSendUsdc: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface HarmonyLedgerBridge extends ILedgerBridge {
  getBalance: (payload: unknown, pk?: string) => Promise<unknown>;
  sendTransaction: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface AvaxLedgerBridge extends ILedgerBridge {
  getAccount: (payload: unknown, pk: string) => Promise<unknown>;
  signTransaction: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface NearLedgerBridge extends ILedgerBridge {
  getPublicKey: (payload: unknown, pk: string) => Promise<unknown>;
  signTransaction: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface TerraLedgerBridge extends ILedgerBridge {
  getPublicKey: (payload: unknown, pk: string) => Promise<unknown>;
  sign: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface EdLedgerBridge extends ILedgerBridge {
  getPublicKey: (payload: unknown, pk: string) => Promise<unknown>;
  sign: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface TaquitoLedgerBridge extends ILedgerBridge {
  getPublicKeyAndHash: (payload: unknown, pk: string) => Promise<unknown>;
  sign: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface ZilliqaLedgerBridge extends ILedgerBridge {
  sendTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  deployContract: (payload: unknown, pk: string) => Promise<unknown>;
  callContract: (payload: unknown, pk: string) => Promise<unknown>;
  getWallet: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface IconLedgerBridge extends ILedgerBridge {
  getBalance: (payload: unknown, pk?: string) => Promise<unknown>;
  getAccount: (payload: unknown, pk: string) => Promise<unknown>;
  sendTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  signTransaction: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface AlgorandLedgerBridge extends ILedgerBridge {
  getAccount: (payload: unknown, pk: string) => Promise<unknown>;
  signBid: (payload: unknown, pk: string) => Promise<unknown>;
  signTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  signGroupTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  signGroupTransactionV2: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface PolkadotLedgerBridge extends ILedgerBridge {
  getAccount: (payload: unknown, pk: string) => Promise<unknown>;
  getBalance: (payload: unknown, pk?: string) => Promise<unknown>;
  contractCall: (payload: unknown, pk: string) => Promise<unknown>;
  sendTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  signPayload: (payload: unknown, pk: string) => Promise<unknown>;
  signRaw: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface AptosLedgerBridge extends ILedgerBridge {
  getAccount: (payload: unknown, pk: string) => Promise<unknown>;
  signTransaction: (payload: unknown, pk?: string) => Promise<unknown>;
  getAccountInfo: (payload: unknown, pk: string) => Promise<unknown>;
  signAndSubmitTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  signAndSubmitBCSTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  signMessageAndVerify: (payload: unknown, pk: string) => Promise<unknown>;
  signMessage: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface TezosLedgerBridge extends ILedgerBridge {
  sendTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  sendContractOrigination: (payload: unknown, pk: string) => Promise<unknown>;
  getAccount: (payload: unknown, pk: string) => Promise<unknown>;
  sendContractInvocation: (payload: unknown, pk: string) => Promise<unknown>;
  sendContractPingOperation: (payload: unknown, pk: string) => Promise<unknown>;
  sendDelegation: (payload: unknown, pk: string) => Promise<unknown>;
}

export interface KadenaLedgerBridge extends ILedgerBridge {
  signTransaction: (payload: unknown, pk: string) => Promise<unknown>;
  signTransactionWithSpireKey: (payload: unknown) => Promise<unknown>;
  createSpireKeyWallet: () => Promise<ConnectedWallet>;
  signSpireKeyLogin: (account: unknown) => Promise<KadenaSignedTransaction>;
}

interface GetBalancePayload {
  params: {
    address?: string;
    network?: string;
    balance?: unknown;
    account?: { accountId: string; publicKey: string };
    hederaSign?: (message: string) => Promise<{ data: { signature: string } }>;
  };
}

export interface ILedgerBridge {
  createWallet: (callback?: unknown, accountOrAddress?: unknown, network?: string) => Promise<OnChainWallet>;
  getBalance: (getBalancePayload: GetBalancePayload) => Promise<unknown>;
}
