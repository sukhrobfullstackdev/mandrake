'use client';

import { getQueryClient } from '@common/query-client';
import { useAppName } from '@hooks/common/client-config';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { EnableMFAEventOnReceived, MagicPayloadMethod } from '@magic-sdk/types';
import { Button, IcoKey, Page, Text } from '@magiclabs/ui-components';
import { Flex, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { copyToClipboard } from '@utils/copy';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function EnableMfaRecoveryCodes() {
  const queryClient = getQueryClient();
  const router = useSendRouter();
  const pathname = usePathname();
  const { t } = useTranslation('send');
  const appName = useAppName();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const recoveryCodes = useStore(state => state.mfaRecoveryCodes);
  const recoveryCodesJoined = recoveryCodes.join();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const showUI = activeRpcPayload?.params?.[0]?.showUI as boolean;
  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;

  const handleFinishSetup = async () => {
    useStore.setState({
      mfaEnrollSecret: null,
      mfaEnrollInfo: null,
      mfaRecoveryCodes: [],
    });
    await queryClient.resetQueries({
      queryKey: [['user', 'info']],
    });
    const activePayload = AtomicRpcPayloadService.getActiveRpcPayload();
    if (activePayload?.method === MagicPayloadMethod.UserSettings && !deeplinkPage) {
      router.replace('/send/rpc/user/magic_auth_settings');
    } else {
      resolveActiveRpcRequest(true);
    }
  };

  const handleCopyRecoveryCode = () => {
    if (recoveryCodesJoined) {
      copyToClipboard(recoveryCodesJoined);
    }
  };

  useEffect(() => {
    if (!recoveryCodesJoined) return;
    AtomicRpcPayloadService.emitJsonRpcEventResponse(EnableMFAEventOnReceived.MFARecoveryCodes, [
      {
        recoveryCode: recoveryCodesJoined,
      },
    ]);
    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);

    if (showUI || showUI === undefined) return;
    handleFinishSetup();
  }, [recoveryCodesJoined]);

  return (
    <>
      <Page.Icon>
        <IcoKey />
      </Page.Icon>
      <Page.Content>
        <VStack my={3}>
          <Text.H3 styles={{ textAlign: 'center' }}>{t('Save your recovery code')}</Text.H3>
          <Text size="sm" styles={{ textAlign: 'center' }}>
            {t(
              'This code can be used to log in if you lose access to your authenticator app. Store it some place safe.',
            )}
          </Text>
        </VStack>
        <Flex
          flex={1}
          direction="row"
          width="100%"
          alignItems="center"
          justifyContent="center"
          padding="0.5rem"
          backgroundColor="gray.100"
          borderRadius="md"
          mt={3}
        >
          <Text.Mono styles={{ color: 'gray.100' }}>{recoveryCodesJoined}</Text.Mono>
        </Flex>
        <VStack mb={6}>
          <Text size="sm" styles={{ textAlign: 'center', color: token('colors.gray.500') }}>
            {t('Your {{appName}} recovery code', { appName })}
          </Text>
        </VStack>
        <Button expand={true} variant="tertiary" label={t('Copy code')} onPress={handleCopyRecoveryCode} />
        <Button expand={true} variant="primary" label={t('Finish setup')} onPress={handleFinishSetup} />
      </Page.Content>
    </>
  );
}
