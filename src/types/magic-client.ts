import { SecretManagementStrategy, SplitkeyMode } from '@constants/wallet-secret-management';

export interface CSPSource {
  client: string;
  clientId: string;
  id: string;
  isActive: boolean;
  timeCreated: string;
  type: 'connect-src';
  value: string;
}

export type ThemeColor = 'auto' | 'dark' | 'light';

export type ThemeCustomBrandType = 1 | 2;

export interface ClientTheme {
  appName: string;
  assetUri: string;
  textColor: `#${string}`;
  buttonColor: `#${string}` | undefined;
  buttonRadius: string | undefined;
  containerRadius: string | undefined;
  backgroundColor: `#${string}` | undefined;
  neutralColor: `#${string}` | undefined;
  themeColor: ThemeColor;
  customBrandingType: ThemeCustomBrandType;
  isDefaultAsset?: boolean;
}

export interface ClientConfig {
  accessAllowlists: {
    bundle: string[];
    domain: string[];
    redirectUrl: string[];
  };
  apiKey: string;
  cspSources: CSPSource[];
  clientId: string;
  clientTheme: ClientTheme;
  configuredAuthProviders: {
    primaryLoginProviders: string[];
    secondaryLoginProviders: string[];
    socialLoginProviders: string[];
  };
  isEnterprise: boolean;
  isSecurityOtpEnabled: boolean;
  productType: 'magic' | 'connect';
  legacyRedirect: boolean;
  features: {
    isFiatOnrampEnabled: boolean;
    isNftViewerEnabled: boolean;
    isNftTransferEnabled: boolean;
    isSendTransactionUiEnabled: boolean;
    isSigningUiEnabled: boolean;
    isGaslessTransactionsEnabled: boolean;
    isTransactionConfirmationEnabled: boolean;
  };
  walletSecretManagement: {
    strategy: SecretManagementStrategy.DKMSV3 | SecretManagementStrategy.SHAMIRS_SECRET_SHARING;
    definition?: {
      mode?: SplitkeyMode.BASE | SplitkeyMode.CLIENT_SPLIT;
      encryptionEndpoint?: string;
      decryptionEndpoint?: string;
    };
  };
}

export interface OAuthApp {
  id: string;
  appId: string;
  redirectId: string;
  appSecret?: string;
}
