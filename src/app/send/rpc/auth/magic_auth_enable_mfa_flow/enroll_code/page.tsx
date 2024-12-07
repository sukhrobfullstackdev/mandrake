'use client';

import { useTranslation } from '@common/i18n';
import { useAppName } from '@hooks/common/client-config';
import { useSendRouter } from '@hooks/common/send-router';
import { useStartTemporaryOtpEnrollMutation } from '@hooks/data/embedded/mfa';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { Button, IcoCopy, LoadingSpinner, Page, QRCode, Text } from '@magiclabs/ui-components';
import { HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { copyToClipboard } from '@utils/copy';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const MfaEnrollCodePage = () => {
  const authUserId = useStore(state => state.authUserId);
  const authUserSessionToken = useStore(state => state.authUserSessionToken);
  const appName = useAppName();
  const router = useSendRouter();
  const pathname = usePathname();
  const { t } = useTranslation('send');
  const { mutate, isPending, data } = useStartTemporaryOtpEnrollMutation();

  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const showUI = activeRpcPayload?.params?.[0]?.showUI as boolean;

  useEffect(() => {
    mutate(
      { authUserId: authUserId!, jwt: authUserSessionToken! },
      {
        onSuccess: response => {
          useStore.setState({
            mfaEnrollSecret: response!.secret,
            mfaEnrollInfo: response?.mfaInfo,
          });
          AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);

          if (!(showUI || showUI === undefined)) {
            router.replace('/send/rpc/auth/magic_auth_enable_mfa_flow/enter_totp');
          }
        },
      },
    );
  }, [authUserId, authUserSessionToken]);

  const handleCopyKey = () => copyToClipboard(data?.secret);

  const onPressNext = () => {
    router.replace('/send/rpc/auth/magic_auth_enable_mfa_flow/enter_totp');
  };

  const renderKey = () => {
    return data?.secret?.match(/.{1,4}/g)?.map(part => (
      <Text.Mono key={part} styles={{ textAlign: 'right' }}>
        {`${part} `}
      </Text.Mono>
    ));
  };

  return (
    <Page.Content>
      {isPending ? (
        <VStack alignItems="center" justifyContent="center">
          <LoadingSpinner />
        </VStack>
      ) : (
        <>
          <QRCode size={120} value={`otpauth://totp/${encodeURIComponent(appName)}?secret=${data?.secret}`} />
          <VStack my={3}>
            <Text.H3 styles={{ textAlign: 'center' }}>{t('Scan this QR code')}</Text.H3>
            <Text size="sm" styles={{ textAlign: 'center' }}>
              {t('Open your authenticator app and scan this QR code or enter your setup key.')}
            </Text>
            <HStack my={2} justifyContent="space-between" width="100%">
              <Text size="sm" styles={{ fontWeight: 500 }}>
                {t('Key')}:
              </Text>
              <HStack>
                {renderKey()}
                <button aria-label="copy-button" onClick={handleCopyKey}>
                  <IcoCopy color={token('colors.brand.base')} />
                </button>
              </HStack>
            </HStack>
          </VStack>
          <Button expand={true} variant="primary" label={t('Next')} onPress={onPressNext} />
        </>
      )}
    </Page.Content>
  );
};

export default MfaEnrollCodePage;
