/* istanbul ignore file */
'use client';

import { EnforceIframe } from '@components/enforce-iframe';
import { useFlags } from '@hooks/common/launch-darkly';
import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { DecodedQueryParams, StoreState, useStore } from '@hooks/store';
import { useStoreSync } from '@hooks/store/sync';
import { ApiWalletAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageRelayer } from '@lib/message-channel/iframe-api-wallets/iframe-message-relayer';
import { getDecodedQueryParams } from '@lib/utils/query-string';
import { useCustomVars } from '@magiclabs/ui-components';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface MagicApiWalletContainerProps {
  decodedQueryParams: DecodedQueryParams;
  encodedQueryParams: string;
}

export default function MagicApiWalletContainer({
  encodedQueryParams,
  decodedQueryParams,
}: MagicApiWalletContainerProps) {
  useStoreSync(useStore, { decodedQueryParams } as Partial<StoreState>);

  const { magicApiKey } = useStore(state => state);
  const { setColors, setRadius } = useCustomVars({});

  const { data: clientConfig } = useClientConfigQuery(
    {
      magicApiKey: getDecodedQueryParams(encodedQueryParams).apiKey || magicApiKey || '',
    },
    { enabled: !!getDecodedQueryParams(encodedQueryParams).apiKey || !!magicApiKey },
  );

  const flags = useFlags();
  const messageRelayer = useRef<IFrameMessageRelayer>();
  const router = useRouter();

  // Unregister service workers to prevent 404 errors in Vercel
  // Important: Retain this code to handle potential return users, even if logs are cleared
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const activeRegistrations = navigator.serviceWorker.getRegistrations();
      activeRegistrations
        .then(function (registrations) {
          for (const registration of registrations) {
            registration.unregister();
          }
        })
        .catch(function (error) {
          logger.log('Service Worker unregistration failed:', error);
        });
    }
  }, []);

  useEffect(() => {
    if (messageRelayer.current) return;
    ApiWalletAtomicRpcPayloadService.setEncodedQueryParams(encodedQueryParams);
    messageRelayer.current = new IFrameMessageRelayer(router, encodedQueryParams, flags);
  }, []);

  useEffect(() => {
    if (messageRelayer.current && flags) {
      messageRelayer.current.setFlags(flags);
    }
  }, [JSON.stringify(flags)]);

  useEffect(() => {
    if (!clientConfig?.productType || !clientConfig?.walletSecretManagement) return;
    if (messageRelayer.current && clientConfig) {
      messageRelayer.current.setAppRoutingConfig(clientConfig?.productType === 'connect');
      const colorMode = clientConfig?.clientTheme.themeColor === 'dark' ? 'dark' : 'light';
      const { textColor, buttonColor, buttonRadius, containerRadius, backgroundColor, neutralColor } =
        clientConfig.clientTheme;
      document.documentElement.setAttribute('data-color-mode', colorMode);
      if (textColor) setColors('text', textColor);
      if (buttonRadius) setRadius('button', buttonRadius);
      if (containerRadius) setRadius('container', containerRadius);
      if (backgroundColor) setColors('surface', backgroundColor);
      if (neutralColor) setColors('neutral', neutralColor);
      if (buttonColor) setColors('brand', buttonColor);
    }
  }, [clientConfig]);

  return <EnforceIframe />;
}
