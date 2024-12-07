'use client';

import ConnectWalletPage from '@app/send/rpc/wallet/mc_login/__components__/connect-wallet';
import Disclaimer from '@app/send/rpc/wallet/mc_login/__components__/disclaimer';
import EmailLoginPage from '@app/send/rpc/wallet/mc_login/__components__/email-login';
import LegacyGoogleSignInPage from '@app/send/rpc/wallet/mc_login/__components__/google-sign-in';
import SocialLoginPage from '@app/send/rpc/wallet/mc_login/__components__/social-login';
import { ConnectWithUILoginMethod } from '@custom-types/connect-with-ui';
import { OAuthProvider } from '@custom-types/oauth';
import { useConnectWithUIMethod } from '@hooks/common/connect-with-ui';
import { useSendRouter } from '@hooks/common/send-router';
import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { capitalize } from '@lib/utils/string-utils';
import { Button, IcoEmail, Page, SharedLogo, SocialLoginButton, Text } from '@magiclabs/ui-components';
import { Box, Flex } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useEffect } from 'react';

export default function LoginFormPage() {
  const { magicApiKey } = useStore.getState();
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const { lastLoggedInType, loginType, setLoginType, isSocialWidgetEnabled, isLegacyGoogleSignInEnabled } =
    useConnectWithUIMethod();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const isUsingThirdPartyWallets = activeRpcPayload?.params?.[0]?.enabledWallets?.web3modal;
  const shouldAutoPromptThirdPartyWallets = activeRpcPayload?.params[0]?.autoPromptThirdPartyWallets;

  const { data: clientConfigData, error: clientConfigError } = useClientConfigQuery(
    { magicApiKey: magicApiKey || '' },
    { enabled: !!magicApiKey },
  );

  useEffect(() => {
    if (clientConfigError) {
      logger.error('LoginForm - Error fetching client config', clientConfigError);
      return router.replace('/send/error/config');
    }
  }, [clientConfigError]);

  useEffect(() => {
    if (!shouldAutoPromptThirdPartyWallets) {
      IFrameMessageService.showOverlay();
    }
  }, [shouldAutoPromptThirdPartyWallets]);

  const handleLoginTypeButton = () => {
    if (loginType === ConnectWithUILoginMethod.EMAIL) {
      if (isSocialWidgetEnabled) setLoginType(OAuthProvider.GOOGLE);
      if (isLegacyGoogleSignInEnabled) setLoginType(ConnectWithUILoginMethod.LEGACY_GOOGLE_SIGN_IN);
      return;
    }
    setLoginType(ConnectWithUILoginMethod.EMAIL);
    return;
  };

  const displayMainLogin = () => {
    switch (loginType) {
      case OAuthProvider.GOOGLE:
        return <SocialLoginPage />;
      case ConnectWithUILoginMethod.EMAIL:
        return <EmailLoginPage />;
      case ConnectWithUILoginMethod.LEGACY_GOOGLE_SIGN_IN:
        return <LegacyGoogleSignInPage />;
      default:
        return null;
    }
  };

  return (
    <Page.Content>
      <Flex mb={2.5}>
        <SharedLogo assetUri={clientConfigData?.clientTheme.assetUri as string} />
      </Flex>
      {lastLoggedInType !== ConnectWithUILoginMethod.UNKNOWN ? (
        <Text aria-label="last login" size="sm" styles={{ color: token('colors.text.tertiary'), textAlign: 'center' }}>
          {t('You last logged in with')} <strong>{capitalize(lastLoggedInType)}</strong>
        </Text>
      ) : null}
      {displayMainLogin()}
      <Box textAlign="center" w="full">
        {(loginType === ConnectWithUILoginMethod.EMAIL && (isLegacyGoogleSignInEnabled || isSocialWidgetEnabled)) ||
        loginType !== ConnectWithUILoginMethod.EMAIL ? (
          <Text aria-label="or" styles={{ fontWeight: '600', color: token('colors.text.tertiary') }} size="sm">
            {t('OR')}
          </Text>
        ) : null}
        <Flex m="0.5rem auto 0" maxW="400px">
          {loginType === ConnectWithUILoginMethod.EMAIL && (isLegacyGoogleSignInEnabled || isSocialWidgetEnabled) ? (
            <SocialLoginButton
              provider="google"
              aria-label="Google"
              label="Google"
              onPress={handleLoginTypeButton}
              expand
            />
          ) : null}
          {loginType !== ConnectWithUILoginMethod.EMAIL ? (
            <Button aria-label="Email" label="Email" onPress={handleLoginTypeButton} variant="tertiary" expand>
              <Button.LeadingIcon color={token('colors.text.primary')}>
                <IcoEmail />
              </Button.LeadingIcon>
            </Button>
          ) : null}
        </Flex>
        {isUsingThirdPartyWallets && <ConnectWalletPage />}
        <Disclaimer />
      </Box>
    </Page.Content>
  );
}
