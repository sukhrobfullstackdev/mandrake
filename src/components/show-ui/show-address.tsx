'use client';

import TokenCompatibilityDisclaimer from '@components/show-ui/token-compatibility-disclaimer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useTranslation } from '@lib/common/i18n';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { copyToClipboard } from '@lib/utils/copy';
import { Button, IcoCheckmark, IcoCopy, LoadingSpinner, QRCode } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { useCallback, useEffect, useState } from 'react';

export default function ShowAddress() {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { t } = useTranslation('send');
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();

  const [isCopied, setIsCopied] = useState(false);

  const { userMetadata } = useUserMetadata();

  useEffect(() => {
    if (!isHydrateSessionComplete) return;
    if (isHydrateSessionError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
    } else {
      IFrameMessageService.showOverlay();
    }
  }, [isHydrateSessionComplete, isHydrateSessionError]);

  const handleCopytoClipboard = useCallback(() => {
    if (!userMetadata?.publicAddress) return;
    copyToClipboard(userMetadata?.publicAddress);
    setIsCopied(true);
  }, [userMetadata?.publicAddress]);

  useEffect(() => {
    if (isCopied) {
      const timeoutId = setTimeout(() => {
        setIsCopied(false);
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [isCopied]);

  return (
    <VStack gap={0} w="full" mt={4}>
      <VStack gap={6}>
        {userMetadata?.publicAddress && (
          <>
            <QRCode value={userMetadata?.publicAddress || ''} />
            <VStack gap={4}>
              <Button size="md" onPress={handleCopytoClipboard} label={isCopied ? t('Copied!') : t('Copy address')}>
                <Button.LeadingIcon>{isCopied ? <IcoCheckmark /> : <IcoCopy />}</Button.LeadingIcon>
              </Button>
              <TokenCompatibilityDisclaimer />
            </VStack>
          </>
        )}
        {!userMetadata?.publicAddress && <LoadingSpinner size={36} strokeWidth={4} />}
      </VStack>
    </VStack>
  );
}
