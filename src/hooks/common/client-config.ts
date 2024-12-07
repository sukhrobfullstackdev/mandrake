import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';

export const useAppName = () => {
  const magicApiKey = useStore(state => state.magicApiKey) || '';
  const { data: clientConfig } = useClientConfigQuery({ magicApiKey }, { enabled: !!magicApiKey });
  const clientTheme = clientConfig?.clientTheme;
  return clientTheme?.appName || '';
};

export const useClientHasMfa = () => {
  const magicApiKey = useStore(state => state.magicApiKey) || '';
  const { data: clientConfig } = useClientConfigQuery({ magicApiKey }, { enabled: !!magicApiKey });
  const configuredAuthProviders = clientConfig?.configuredAuthProviders as { secondaryLoginProviders: string[] };
  return configuredAuthProviders?.secondaryLoginProviders.includes('mfa') || false;
};

export const useClientConfigFeatureFlags = () => {
  const magicApiKey = useStore(state => state.magicApiKey) || '';
  const { data: clientConfig } = useClientConfigQuery({ magicApiKey }, { enabled: !!magicApiKey });
  const features = clientConfig?.features;
  return features;
};

export const useClientConfigAccessAllowlists = () => {
  const magicApiKey = useStore(state => state.magicApiKey) || '';
  const { data: clientConfig } = useClientConfigQuery({ magicApiKey }, { enabled: !!magicApiKey });
  const accessAllowlists = clientConfig?.accessAllowlists;
  return accessAllowlists;
};

export const useClientId = () => {
  const magicApiKey = useStore(state => state.magicApiKey) || '';
  const { data: clientConfig, error } = useClientConfigQuery({ magicApiKey }, { enabled: !!magicApiKey });
  return {
    clientId: clientConfig?.clientId || '',
    error,
  };
};

export const useCustomBrandingType = () => {
  const magicApiKey = useStore(state => state.magicApiKey) || '';
  const { data: clientConfig } = useClientConfigQuery({ magicApiKey }, { enabled: !!magicApiKey });
  const clientTheme = clientConfig?.clientTheme;
  return clientTheme?.customBrandingType;
};

export const useAssetUri = () => {
  const magicApiKey = useStore(state => state.magicApiKey) || '';
  const { data: clientConfig } = useClientConfigQuery({ magicApiKey }, { enabled: !!magicApiKey });
  const clientTheme = clientConfig?.clientTheme;
  return clientTheme?.assetUri || '';
};

export const useColorMode = () => {
  const magicApiKey = useStore(state => state.magicApiKey) || '';
  const { data: clientConfig } = useClientConfigQuery({ magicApiKey }, { enabled: !!magicApiKey });
  const clientTheme = clientConfig?.clientTheme;
  return clientTheme?.themeColor;
};

export const useThemeRadii = () => {
  const magicApiKey = useStore(state => state.magicApiKey) || '';
  const { data: clientConfig } = useClientConfigQuery({ magicApiKey }, { enabled: !!magicApiKey });
  const clientTheme = clientConfig?.clientTheme;
  return {
    buttonRadius: clientTheme?.buttonRadius,
    containerRadius: clientTheme?.containerRadius,
  };
};

export const useThemeColors = () => {
  const magicApiKey = useStore(state => state.magicApiKey) || '';
  const { data: clientConfig } = useClientConfigQuery({ magicApiKey }, { enabled: !!magicApiKey });
  const clientTheme = clientConfig?.clientTheme;
  return {
    backgroundColor: clientTheme?.backgroundColor || null,
    buttonColor: clientTheme?.buttonColor || null,
    neutralColor: clientTheme?.neutralColor || null,
    textColor: clientTheme?.textColor || null,
  };
};

export const useConfiguredAuthProviders = () => {
  const magicApiKey = useStore(state => state.magicApiKey) || '';
  const { data: clientConfig } = useClientConfigQuery({ magicApiKey }, { enabled: !!magicApiKey });
  return clientConfig?.configuredAuthProviders;
};
