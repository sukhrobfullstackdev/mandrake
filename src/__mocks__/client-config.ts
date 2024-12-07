import { SecretManagementStrategy } from '@constants/wallet-secret-management';
import { ClientConfig } from '@custom-types/magic-client';

export const mockClientConfig: ClientConfig = {
  accessAllowlists: {
    bundle: [],
    domain: ['https://relayer-test-kitchen.vercel.app', 'http://localhost'],
    redirectUrl: [],
  },
  cspSources: [],
  clientId: 'CDk_DaL_H72invSvuWH3--NDuvbq8ncSoh-ZURWKmKQ=',
  clientTheme: {
    appName: 'Staging Dedicated Default Session Persistence',
    assetUri: '',
    backgroundColor: undefined,
    buttonColor: undefined,
    buttonRadius: undefined,
    containerRadius: undefined,
    customBrandingType: 1,
    neutralColor: undefined,
    textColor: '#000000',
    themeColor: 'auto',
  },
  configuredAuthProviders: {
    primaryLoginProviders: [],
    secondaryLoginProviders: [],
    socialLoginProviders: [],
  },
  isEnterprise: false,
  isSecurityOtpEnabled: false,
  productType: 'magic',
  legacyRedirect: true,
  features: {
    isTransactionConfirmationEnabled: false,
    isFiatOnrampEnabled: false,
    isNftViewerEnabled: false,
    isNftTransferEnabled: false,
    isSendTransactionUiEnabled: false,
    isSigningUiEnabled: false,
    isGaslessTransactionsEnabled: false,
  },
  walletSecretManagement: {
    definition: undefined,
    strategy: SecretManagementStrategy.DKMSV3,
  },
};
