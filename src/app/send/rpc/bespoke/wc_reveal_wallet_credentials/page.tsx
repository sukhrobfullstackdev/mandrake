'use client';

import { WCSVGClose, WCSVGExclaimation } from '@app/send/rpc/bespoke/wc_reveal_wallet_credentials/__assets__';
import { CredentialType } from '@app/send/rpc/bespoke/wc_reveal_wallet_credentials/__types__';
import DisplayWalletCredentials from '@components/wc-reveal-credentials/display-wallet-credentials';
import WalletCredentialsContentHeader from '@components/wc-reveal-credentials/wallet-credentials-content-header';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';

import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useFlags } from '@hooks/common/launch-darkly';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Header, Page } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Center, VStack } from '@styled/jsx';
import { HydrationBoundary, dehydrate, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function RevealWalletCredentials() {
  const queryClient = useQueryClient();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const { isComplete: isHydrateSessionComplete, isError: isHydrateSessionError } = useHydrateSession();
  const credentialType =
    activeRpcPayload?.params[0]?.credentialType === CredentialType.PrivateKey
      ? CredentialType.PrivateKey
      : CredentialType.SeedPhrase;
  const flags = useFlags();
  const isRevealEnabled = flags?.isWcRevealCredentialsAllowed;

  useEffect(() => {
    if (!isHydrateSessionComplete) return;
    if (isHydrateSessionError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
    } else if (isRevealEnabled) {
      IFrameMessageService.showOverlay();
    }
  }, [isHydrateSessionComplete, isHydrateSessionError, isRevealEnabled]);

  const handleClose = () => {
    resolveActiveRpcRequest(true);
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Box h="100vh" w="100vw" bg="#0f0f0f" data-color-mode="dark">
        <Page showBorder={false}>
          <Page.Header>
            <Header.RightAction>
              <button
                onClick={handleClose}
                className={css({ bg: 'transparent', cursor: 'pointer' })}
                aria-label="close"
              >
                <WCSVGClose />
              </button>
            </Header.RightAction>
          </Page.Header>

          <Page.Content>
            <VStack mt="-1.5rem" mx="-1.75rem" mb={6}>
              <Center h={16} w={16} bg="#FFA64C1A" rounded="1.25rem">
                <WCSVGExclaimation />
              </Center>
              <WalletCredentialsContentHeader credentialType={credentialType} />
              <DisplayWalletCredentials credentialType={credentialType} />
            </VStack>
          </Page.Content>
        </Page>
      </Box>
    </HydrationBoundary>
  );
}
