'use client';
import PageFooter from '@components/show-ui/footer';
import WalletPageHeader from '@components/show-ui/wallet-page-header';
import { AppNameCollapsible } from '@components/sign-typed-data/sign-typed-data-page';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { WalletType } from '@custom-types/wallet';
import { useAppName, useAssetUri, useClientConfigFeatureFlags } from '@hooks/common/client-config';
import { formatMessageForConfirmTab, useConfirmAction } from '@hooks/common/confirm-action';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { ConfirmActionType } from '@hooks/data/embedded/confirm-action';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { getQueryClient } from '@lib/common/query-client';
import { DkmsService } from '@lib/dkms';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { isMessageHexString } from '@lib/utils/is-message-hex-string';
import Web3Service from '@lib/utils/web3-services/web3-service';
import { Button, ClientAssetLogo, Page, Text } from '@magiclabs/ui-components';
import { Box, HStack, Spacer, VStack } from '@styled/jsx';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { toUtf8String } from 'ethers';
import { useEffect, useState } from 'react';

export default function PersonalSignPage() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const appName = useAppName();
  const assetUri = useAssetUri();
  const features = useClientConfigFeatureFlags();
  const { t } = useTranslation('send');

  const { authUserId, authUserSessionToken, decodedQueryParams } = useStore(state => state);

  const [isLoading, setIsLoading] = useState(false);
  const [messageToDisplay, setMessageToDisplay] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  const queryClient = getQueryClient();
  const { isComplete: isSessionHydrateComplete, isError: isSessionHyrateError } = useHydrateSession({
    enabled: !authUserId || !authUserSessionToken,
  });

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();

  const { doConfirmActionIfRequired, isActionConfirmed, isActionConfirmationExpired, isSkipConfirmAction } =
    useConfirmAction();

  const handlePersonalSignForUser = async () => {
    if (!authUserId || !authUserSessionToken) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { walletInfoData, awsCreds } = await getWalletInfoAndCredentials({
        authUserId,
        authUserSessionToken,
        walletType: WalletType.ETH,
      });

      const [message, signerAddress] = activeRpcPayload?.params as [string, string];
      const isExpectedSigner = await Web3Service.compareAddresses([signerAddress, walletInfoData.publicAddress]);
      if (!isExpectedSigner) {
        rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedSigning);
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

      // Headless flow
      const privateKey = await DkmsService.reconstructSecret(awsCreds, walletInfoData.encryptedPrivateAddress);
      const signature = await Web3Service.personalSign(message, privateKey);
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
      let [message] = activeRpcPayload?.params as [string, string];
      if (isMessageHexString(message)) {
        try {
          message = toUtf8String(message);
        } catch {
          // If hex is from uint8array, the above will throw an error. Original message will be set below.
        }
      }
      setMessageToDisplay(message);
      IFrameMessageService.showOverlay();
    } else {
      handlePersonalSignForUser();
    }
  }, []);

  //--- Confirm Request modal UI handling ---
  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserDeniedSigning);
  };

  // Hydrate or reject.
  useEffect(() => {
    if (!isSessionHydrateComplete) return;
    if (isSessionHyrateError) {
      rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.UserDeniedAccountAccess);
    }
  }, [isSessionHydrateComplete, isSessionHyrateError]);

  useEffect(() => {
    if (isActionConfirmed || isSkipConfirmAction) handlePersonalSignForUser();
    if (isActionConfirmationExpired) setIsLoading(false);
  }, [isActionConfirmed, isActionConfirmationExpired, isSkipConfirmAction]);

  // Do not return any UI if signing UI is disabled,
  // otherwise useChainInfo in WalletPageHeader will make unncessary network calls to user.
  if (!features?.isSigningUiEnabled) return null;
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Page backgroundType="blurred">
        <WalletPageHeader onPressClose={handleClose} />
        <Page.Icon>
          <Box mt={6}>
            <ClientAssetLogo assetUri={assetUri} />
          </Box>
        </Page.Icon>
        <Page.Content>
          <VStack gap={4}>
            <Text size="lg" fontWeight="medium">
              {t('Confirm Request')}
            </Text>
            <AppNameCollapsible appName={appName} domainOrigin={decodedQueryParams?.domainOrigin}>
              <Text size="sm">{messageToDisplay}</Text>
            </AppNameCollapsible>
            {errorMessage && (
              <VStack>
                <Text variant="error">{errorMessage}</Text>
                <Spacer size="4" />
              </VStack>
            )}
            <HStack w="full" gap={2}>
              <Button label={t('Cancel')} variant="neutral" expand onPress={handleClose} />
              <Button
                label={t('Confirm')}
                variant="primary"
                expand
                disabled={isLoading}
                validating={isLoading}
                onPress={handlePersonalSignForUser}
                aria-label="sign"
              />
            </HStack>
          </VStack>
        </Page.Content>
        <PageFooter />
      </Page>
    </HydrationBoundary>
  );
}
