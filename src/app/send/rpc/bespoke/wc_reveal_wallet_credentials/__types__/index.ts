export enum CredentialType {
  PrivateKey = 'private_key',
  SeedPhrase = 'seed_phrase',
}

export interface WalletCredentials {
  credentialType: CredentialType;
}
