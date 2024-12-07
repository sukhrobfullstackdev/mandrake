'use client';
import { normalizeTypedData, SignTypedDataPage } from '@components/sign-typed-data/sign-typed-data-page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useClientConfigFeatureFlags } from '@hooks/common/client-config';
import { formatMessageForConfirmTab, useConfirmAction } from '@hooks/common/confirm-action';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { ConfirmActionType } from '@hooks/data/embedded/confirm-action';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { DkmsService } from '@lib/dkms';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import Web3Service from '@lib/utils/web3-services/web3-service';
import { EIP712TypedData } from 'eth-sig-util';
import { useEffect, useState } from 'react';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { WalletType } from '@custom-types/wallet';

export default function EthSignTypedDataV3Page() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const features = useClientConfigFeatureFlags();
  const { authUserId, authUserSessionToken, decodedQueryParams } = useStore(state => state);
  const [isLoading, setIsLoading] = useState(false);
  const [messageToDisplay, setMessageToDisplay] = useState<string | EIP712TypedData>('');
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useTranslation('send');

  const { isComplete: isSessionHydrateComplete, isError: isSessionHydrateError } = useHydrateSession({
    enabled: !authUserId || !authUserSessionToken,
  });

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();

  const { doConfirmActionIfRequired, isActionConfirmed, isActionConfirmationExpired, isSkipConfirmAction } =
    useConfirmAction();

  const handleSignTypedDataV3ForUser = async () => {
    if (!authUserId || !authUserSessionToken) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { walletInfoData, awsCreds } = await getWalletInfoAndCredentials({
        authUserId,
        authUserSessionToken,
        walletType: WalletType.ETH,
      });
      const [signerAddress, message] = activeRpcPayload?.params as [string, string];
      const isExpectedSigner = await Web3Service.compareAddresses([signerAddress, walletInfoData.publicAddress]);
      if (!isExpectedSigner) {
        rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.SignerMismatch);
        return;
      }

      if (features?.isSigningUiEnabled && !isActionConfirmed && !isSkipConfirmAction) {
        doConfirmActionIfRequired({
          action: ConfirmActionType.SignMessage,
          payload: {
            message: formatMessageForConfirmTab(activeRpcPayload?.params[0]),
            request_domain: decodedQueryParams?.domainOrigin,
          },
        });
        return;
      }

      // Headless Flow
      const privateKey = await DkmsService.reconstructSecret(awsCreds, walletInfoData.encryptedPrivateAddress);
      const signature = await Web3Service.signTypedDataV3(normalizeTypedData(message), privateKey);
      resolveActiveRpcRequest(signature);
    } catch (err) {
      setErrorMessage(t('An error occurred. Please try again.'));
      logger.error('Signing Error', { error: err });
      if (!features?.isSigningUiEnabled) {
        rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.SigningError);
      }
    }
    setIsLoading(false);
  };

  //--- Headless signature handling or show UI ---
  useEffect(() => {
    if (features?.isSigningUiEnabled) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [signerAddress, message] = activeRpcPayload?.params as [string, string | EIP712TypedData];
      setMessageToDisplay(message);
      IFrameMessageService.showOverlay();
    } else {
      handleSignTypedDataV3ForUser();
    }
  }, []);

  //--- Confirm Request modal UI handling ---

  // Hydrate or reject.
  useEffect(() => {
    if (!isSessionHydrateComplete) return;
    if (isSessionHydrateError) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedAccountAccess);
    }
  }, [isSessionHydrateComplete, isSessionHydrateError]);

  const onClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedSigning);
  };

  useEffect(() => {
    if (isActionConfirmed || isSkipConfirmAction) handleSignTypedDataV3ForUser();
    if (isActionConfirmationExpired) setIsLoading(false);
  }, [isActionConfirmed, isActionConfirmationExpired, isSkipConfirmAction]);

  if (!features?.isSigningUiEnabled) return null;
  return (
    <SignTypedDataPage
      onConfirm={handleSignTypedDataV3ForUser}
      onClose={onClose}
      isLoading={isLoading}
      message={messageToDisplay}
      errorMessage={errorMessage}
    />
  );
}
