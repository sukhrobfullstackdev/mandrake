'use client';

import { LoginProvider } from '@components/reveal-private-key/__type__';
import AdditionalProviders from '@components/reveal-private-key/additional-providers';
import LoginForm from '@components/reveal-private-key/login-form';
import PageFooter from '@components/show-ui/footer';
import { useAssetUri, useConfiguredAuthProviders } from '@hooks/common/client-config';
import { useTranslation } from '@lib/common/i18n';
import { getQueryClient } from '@lib/common/query-client';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { ClientAssetLogo, IcoLockLocked, Page, PresentationLogo, Text } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export default function RevealKeyLoginPage() {
  const { t } = useTranslation('send');
  const queryClient = getQueryClient();
  const assetUri = useAssetUri();
  const providers = useConfiguredAuthProviders();
  const [focusedProvider, setFocusedProvider] = useState<LoginProvider | undefined>();

  useEffect(() => {
    if (!providers?.primaryLoginProviders || providers.primaryLoginProviders.length === 0) return;

    setFocusedProvider(providers.primaryLoginProviders[0] as LoginProvider);
  }, [providers?.primaryLoginProviders]);

  useEffect(() => {
    IFrameMessageService.showOverlay();
  }, []);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Page backgroundType="solid">
        <Page.Icon>
          <ClientAssetLogo assetUri={assetUri}>
            <ClientAssetLogo.PlaceholderIcon>
              <PresentationLogo />
            </ClientAssetLogo.PlaceholderIcon>
          </ClientAssetLogo>
        </Page.Icon>
        <Page.Content>
          <HStack>
            <IcoLockLocked width={16} height={16} color={token('colors.neutral.primary')} />
            <Text size="sm">{t('Secure private key access')}</Text>
          </HStack>
          <LoginForm focusedProvider={focusedProvider} />
          <AdditionalProviders focusedProvider={focusedProvider} setFocusedProvider={setFocusedProvider} />
        </Page.Content>
        <PageFooter />
      </Page>
    </HydrationBoundary>
  );
}
