'use client';

import { T, useTranslation } from '@common/i18n';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Button, FwkAuthy, FwkGoogleAuthenticator, Page, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { isAndroidDevice } from '@utils/platform';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const googleAuthAndroidLink = 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2';
const googleAuthAppStoreLink = 'https://apps.apple.com/us/app/google-authenticator/id388497605';

const MfaInitialPromptPage = () => {
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const pathname = usePathname();

  useEffect(() => {
    IFrameMessageService.showOverlay();
    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
  }, []);

  const onPressNext = () => {
    router.replace('/send/rpc/auth/magic_auth_enable_mfa_flow/enroll_code');
  };

  return (
    <Page.Content>
      <HStack>
        <FwkAuthy height={36} width={36} />
        <FwkGoogleAuthenticator height={36} width={36} />
      </HStack>
      <VStack mt={3} mb={6}>
        <Text.H3 styles={{ textAlign: 'center' }}>{t("You'll need an authenticator app")}</Text.H3>
        <Text size="sm" styles={{ textAlign: 'center' }}>
          <T
            ns="send"
            translate="To enable multi-factor authentication, you will need to use an authenticator app like <authyLink/> or <googleAuthLink/>."
          >
            <Link target="_blank" id="authyLink" href="https://authy.com/" rel="noreferrer">
              <Text size="sm" inline={true} styles={{ fontWeight: 500, color: token('colors.blue.600') }}>
                Authy
              </Text>
            </Link>
            <Link
              target="_blank"
              id="googleAuthLink"
              className={css({ color: 'blue' })}
              href={isAndroidDevice() ? googleAuthAndroidLink : googleAuthAppStoreLink}
              rel="noreferrer"
            >
              <Text size="sm" inline={true} styles={{ fontWeight: 500, color: token('colors.blue.600') }}>
                Google Authenticator
              </Text>
            </Link>
          </T>
        </Text>
      </VStack>
      <Button expand={true} variant="primary" label={t('Next')} onPress={onPressNext} />
    </Page.Content>
  );
};

export default MfaInitialPromptPage;
