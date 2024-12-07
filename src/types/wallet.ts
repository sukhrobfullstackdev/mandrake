import { RecoveryFactor } from '@custom-types/mfa';
import { DelegatedWalletInfo, LoginMethodType, UserConsentTypes, WebAuthnInfoType } from './api-response';

export enum WalletType {
  ETH = 'ETH',
  BITCOIN = 'BITCOIN',
  FLOW = 'FLOW',
  ICON = 'ICON',
  HARMONY = 'HARMONY',
  SOLANA = 'SOLANA',
  ZILLIQA = 'ZILLIQA',
  TAQUITO = 'TAQUITO',
  ALGOD = 'ALGOD',
  POLKADOT = 'POLKADOT',
  TEZOS = 'TEZOS',
  AVAX = 'AVAX',
  ED = 'ED',
  CONFLUX = 'CONFLUX',
  TERRA = 'TERRA',
  HEDERA = 'HEDERA',
  NEAR = 'NEAR',
  COSMOS = 'COSMOS',
  APTOS = 'APTOS',
  SUI = 'SUI',
  KADENA = 'KADENA',
}

export interface WalletPregenData {
  claimed: boolean;
  clientId: string;
  encryptedDataKey: string;
  encryptedPrivateKey: string;
  expiresAt: number;
  identifier: string;
  identifierType: string;
  jobId: string;
  kmsId: string;
  publicAddress: string;
  status: string;
  statusDetail: string;
}

export type WalletInfo = {
  delegatedWalletInfo: DelegatedWalletInfo;
  encryptedPrivateAddress: string;
  encryptedSeedPhrase: string;
  hdPath: string;
  network: string;
  publicAddress: string;
  shouldCreateWallet: boolean;
  usedChainIds: string[];
  utcTimestampMs: number;
  walletId: string;
  walletScope: string;
  walletType: WalletType;
  walletPregenData: WalletPregenData | null;
};

export type WalletInfoResponse = {
  authWalletId: string;
  delegatedWalletInfo: DelegatedWalletInfo;
  encryptedClientPrivateAddressShare?: string | null;
  encryptedClientPrivateAddressShareMetadata?: string | null;
  encryptedClientSeedPhraseShare?: string | null;
  encryptedClientSeedPhraseShareMetadata?: string | null;
  encryptedMagicPrivateAddressShare?: string | null;
  encryptedMagicPrivateAddressShareMetadata?: string | null;
  encryptedMagicSeedPhraseShare?: string | null;
  encryptedMagicSeedPhraseShareMetadata?: string | null;
  encryptedPrivateAddress: string;
  encryptedSeedPhrase?: string | null;
  hdPath: string;
  publicAddress: string;
  shouldCreateWallet: boolean;
  utcTimestampMs?: number;
};

export type WalletSyncResponse = {
  authUserId: string;
  encryptedClientPrivateAddressShare?: string | null;
  encryptedClientPrivateAddressShareMetadata?: string | null;
  encryptedClientSeedPhraseShare?: string | null;
  encryptedClientSeedPhraseShareMetadata?: string | null;
  encryptedMagicPrivateAddressShare?: string | null;
  encryptedMagicPrivateAddressShareMetadata?: string | null;
  encryptedMagicSeedPhraseShare?: string | null;
  encryptedMagicSeedPhraseShareMetadata?: string | null;
  encryptedPrivateAddress: string;
  encryptedSeedPhrase?: string | null;
  hdPath: string;
  publicAddress: string;
  walletId: string;
  walletType: string;
};

export interface UniversalUserInfoRetrieveResponse {
  authUserId: string;
  authUserMfaActive: boolean;
  authUserWalletId: string;
  encryptedPrivateAddress: string;
  encryptedSeedPhrase: string;
  publicAddress: string;
  delegatedWalletInfo: {
    delegatedAccessToken: string;
    delegatedIdentityId: string;
    delegatedKeyId: string;
    delegatedPoolId: string;
    shouldCreateDelegatedWallet: boolean;
  };
  utcTimestampMs: number;
  clientId: string;
  consent: UserConsentTypes;
  usedChainIds: Array<string>;
  challengeMessage: string;
  hdPath: string;
  login: {
    identifiers: {
      identifier: string;
      identifierSource: string;
      identifierType: string;
    }[];
    type: LoginMethodType;
    oauth2: string | null;
    webauthn: string | null | WebAuthnInfoType;
  };
  walletScope: string;
  recoveryFactors: RecoveryFactor[];
}
