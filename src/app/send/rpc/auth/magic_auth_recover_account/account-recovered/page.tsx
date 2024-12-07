'use client';
import PageFooter from '@components/show-ui/footer';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { RecoverAccountEventEmit, RecoverAccountEventOnReceived } from '@magic-sdk/types';
import { Button, IcoShieldApproved, Page, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { useEffect } from 'react';

export default function AccountRecoveredPage() {
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  useEffect(() => {
    AtomicRpcPayloadService.onEvent(RecoverAccountEventEmit.UpdateEmail, email => {
      if (activeRpcPayload) {
        activeRpcPayload.params[0].email = email;
        router.replace('/send/rpc/auth/magic_auth_update_email/recover_account_recency');
      }
    });
    AtomicRpcPayloadService.emitJsonRpcEventResponse(RecoverAccountEventOnReceived.AccountRecovered);
    AtomicRpcPayloadService.emitJsonRpcEventResponse(RecoverAccountEventOnReceived.UpdateEmailRequired);
  }, []);

  return (
    <>
      <Page.Icon>
        <IcoShieldApproved />
      </Page.Icon>
      <Page.Content>
        <VStack gap={6}>
          <Text.H3>{t('Account recovered')}</Text.H3>
          <Text styles={{ textAlign: 'center' }} variant={'text'}>
            {t('To keep your account secure, you’ll need to update your email address')}
          </Text>
          <Button
            onPress={() => router.replace('/send/rpc/auth/magic_auth_update_email/recover_account_recency')}
            label="Update email"
          />
        </VStack>
      </Page.Content>
      <PageFooter />
    </>
  );
}
