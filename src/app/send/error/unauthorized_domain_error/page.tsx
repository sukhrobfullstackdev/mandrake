'use client';

import { useTranslation } from '@common/i18n';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useAppName } from '@hooks/common/client-config';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Button, Error } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { useEffect } from 'react';

interface Props {
  searchParams: { origin: string };
}

export default function UnauthorizedDomainError({ searchParams }: Props) {
  const { t } = useTranslation('send');
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const appName = useAppName();

  const domainPattern = /https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+/g;
  const domainsFromErrorMessage = searchParams.origin?.match(domainPattern);

  useEffect(() => {
    IFrameMessageService.showOverlay();
  }, []);

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UnauthorizedDomain);
    IFrameMessageService.hideOverlay();
  };

  return (
    <Error
      backgroundType="blurred"
      title={t('Unauthorized domain')}
      message={t(`{{appName}} has not approved access for {{domain}}`, {
        appName,
        domain: domainsFromErrorMessage ? domainsFromErrorMessage[0] : (searchParams.origin ?? 'the current domain'),
      })}
    >
      <Error.Button>
        <VStack gap={2}>
          <Button
            label={t('Learn more')}
            onPress={() => window.open('https://magic.link/docs/authentication/security/allowlists/domain-allowlist')}
            size="md"
            variant="text"
          />
          <Button label={t('Close')} onPress={handleClose} />
        </VStack>
      </Error.Button>
    </Error>
  );
}
