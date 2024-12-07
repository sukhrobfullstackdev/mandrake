'use client';
import { useUpdateEmailContext } from '@app/send/rpc/auth/magic_auth_update_email/update-email-context';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { LoadingSpinner, Page } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { useEffect } from 'react';

export default function RecoverAccountRecency() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const credential = activeRpcPayload?.params?.[0]?.credential;
  const updateEmailContext = useUpdateEmailContext();
  const router = useSendRouter();

  useEffect(() => {
    if (!credential) return;

    updateEmailContext.setUpdateEmailState({
      ...updateEmailContext,
      updateEmailCredential: credential,
    });

    activeRpcPayload.params[0] = {
      ...activeRpcPayload.params[0],
      credential: undefined,
    };

    router.replace('/send/rpc/auth/magic_auth_update_email/input_address');
  }, [credential]);

  return (
    <Page backgroundType="blurred">
      <Page.Content>
        <VStack mt={12} mb={24}>
          <LoadingSpinner />
        </VStack>
      </Page.Content>
    </Page>
  );
}
