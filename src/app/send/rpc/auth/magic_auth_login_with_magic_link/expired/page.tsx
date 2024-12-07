'use client';

import { useTranslation } from '@common/i18n';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { Button, EmailWbr, IcoExpiration, Page, Text } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';

export default function LoginWithEmailLinkExpired() {
  const { t } = useTranslation('send');

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const router = useSendRouter();

  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const email = activeRpcPayload?.params?.[0]?.email as string;

  return (
    <>
      <Page.Icon>
        <IcoExpiration />
      </Page.Icon>
      <Page.Content>
        <Text.H4>{t('Magic link expired')}</Text.H4>
        <Text>{t('Send another magic link to')}</Text>
        <Text styles={{ textAlign: 'center' }}>
          <EmailWbr email={email} />
        </Text>
        <Text>{t('to login or sign up')}</Text>
        <Box mt={1}></Box>
        <Button
          label={t('Resend Email')}
          onPress={() => {
            router.replace('/send/rpc/auth/magic_auth_login_with_magic_link/start');
          }}
          size="md"
          variant="primary"
        />
        <Button
          label={t('Close')}
          onPress={() => {
            rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
              closedByUser: true,
            });
          }}
          size="md"
          variant="text"
        />
      </Page.Content>
    </>
  );
}
