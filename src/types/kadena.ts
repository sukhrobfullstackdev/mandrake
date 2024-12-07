interface Sig {
  sig: string;
  pubKey: string;
}

export interface ConnectedWallet {
  accountName: string;
  isReady: () => Promise<unknown>;
  [key: string]: unknown;
}

export interface KadenaSignedTransaction {
  cmd: string;
  hash: string;
  sigs: Sig[];
}

export type KadenaUserMetadata = {
  accountName: string;
  publicKey: string;
  loginType: string;
  isMfaEnabled: boolean;
  email?: string;
  phoneNumber?: string;
  spireKeyInfo?: { [key: string]: unknown };
};
