'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useThirdPartyWalletStartQuery } from '@hooks/data/embedded/third-party-wallet';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { Button, LogoWalletConnectMono } from '@magiclabs/ui-components';
import { Flex } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useEffect, useState } from 'react';

export default function ConnectWalletPage() {
  const { t } = useTranslation('send');
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const [isValidating, setIsValidating] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const shouldAutoPromptThirdPartyWallets = activeRpcPayload?.params[0]?.autoPromptThirdPartyWallets;

  const { mutateAsync: mutateWalletStartAsync } = useThirdPartyWalletStartQuery();

  const handleConnectWallet = () => {
    setIsDisabled(true);
    setIsValidating(true);
    AtomicRpcPayloadService.emitJsonRpcEventResponse('web3modal_selected');
  };

  const handleWalletConnectionRejected = () => {
    setIsDisabled(false);
    setIsValidating(false);
    if (shouldAutoPromptThirdPartyWallets) {
      // If 3pw connection closes, close the modal & reject the payload
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction);
    }
  };

  const handleWalletConnectionAccepted = (publicAddress: string) => {
    mutateWalletStartAsync({ publicAddress, walletProvider: 'WALLET_CONNECT' }).catch((e: string) =>
      logger.error('Error starting wallet login', e),
    );
    resolveActiveRpcRequest([publicAddress]);
  };

  useEffect(() => {
    AtomicRpcPayloadService.onEvent('wallet_connected', address => {
      handleWalletConnectionAccepted(address as string);
    });
    AtomicRpcPayloadService.onEvent('wallet_rejected', handleWalletConnectionRejected);

    if (shouldAutoPromptThirdPartyWallets) {
      handleConnectWallet();
    }
  }, []);

  return (
    <Flex
      style={{
        maxWidth: '25rem',
        margin: '0.5rem auto 0.7rem',
      }}
    >
      <Button
        disabled={isDisabled}
        label={t('Connect Wallet')}
        onPress={handleConnectWallet}
        variant="tertiary"
        aria-label="connect-wallet"
        expand
        validating={isValidating}
      >
        <Button.LeadingIcon color={token('colors.text.primary')}>
          <LogoWalletConnectMono />
        </Button.LeadingIcon>
      </Button>
    </Flex>
  );
}
