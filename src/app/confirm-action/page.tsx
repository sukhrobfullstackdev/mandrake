'use client';

import { ConfirmTransactionDetails } from '@app/confirm-action/__components__/confirm-transaction-details/confirm-transaction-details';
import { SendTransactionDetails } from '@app/confirm-action/__components__/send-transaction-details/send-transaction-details';
import { SignMessageDetails } from '@app/confirm-action/__components__/sign-message-details/sign-message-details';
import { CollectibleTransferPreview } from '@components/collectible/collectible-transfer-preview';
import { useNewTabContext } from '@components/new-tab/new-tab-context';
import PageFooter from '@components/show-ui/footer';
import { NFT_TRANSFER_ROUTES } from '@constants/nft';
import { ActionStatus, DecodedTctPayload } from '@custom-types/confirm-action';
import { useAppName, useAssetUri } from '@hooks/common/client-config';
import { useSendRouter } from '@hooks/common/send-router';
import { ConfirmActionInfo, ConfirmActionType } from '@hooks/data/embedded/confirm-action';
import { useStore } from '@hooks/store';
import { useTranslation } from '@lib/common/i18n';
import { getClientLogger } from '@lib/services/client-logger';
import { ConfirmActionService } from '@lib/services/confirm-action';
import { ConfirmResponse } from '@lib/services/confirm-action/complete-confirm';
import { data } from '@lib/services/web-storage/data-api';
import { isMobileSdk } from '@lib/utils/platform';
import { getDecodedTctPayload, isTctTokenInvalidOrExpired } from '@lib/utils/tct';
import { Button, ClientAssetLogo, LoadingSpinner, Page, Text } from '@magiclabs/ui-components';
import { HStack, Spacer, VStack } from '@styled/jsx';
import { EIP712TypedData } from 'eth-sig-util';
import { useEffect, useState } from 'react';

export default function ConfirmAction() {
  const assetUri = useAssetUri();
  const appName = useAppName();
  const { isThemeLoaded } = useNewTabContext();
  const router = useSendRouter();
  const [apiKey, setApiKey] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRequestExpired, setIsRequestExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requestTimeoutId, setRequestTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined);

  // Action information
  const [actionInfo, setActionInfo] = useState({} as ConfirmActionInfo);
  const [tctPayloadState, setTctPayload] = useState({} as DecodedTctPayload);
  const [payloadState, setMessage] = useState<EIP712TypedData | string>('');
  const [actionType, setActionType] = useState('');
  const [actionStatus, setActionStatus] = useState(ActionStatus.PENDING);
  const [confirmationId, setConfirmationId] = useState('');

  // tct
  const [tempConfirmToken, setTempConfirmToken] = useState('');

  const { t } = useTranslation('common');

  useEffect(() => {
    const initializeConfirmation = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tct = urlParams.get('tct') as string;
      const authUserId = urlParams.get('authUserId') as string;
      const authUserSessionToken = urlParams.get('authUserSessionToken') as string;
      if (!tct) return;

      setTempConfirmToken(tct);

      const tctPayload = getDecodedTctPayload(tct);
      setTctPayload(tctPayload);
      setApiKey(tctPayload.api_key);
      useStore.setState({ magicApiKey: tctPayload.api_key });
      useStore.setState({ authUserId });
      useStore.setState({ authUserSessionToken });

      const isTctTokenInvalid = await isTctTokenInvalidOrExpired(tct);

      const confirmPayloadResponse = await ConfirmActionService.getConfirmPayload(tct);
      setActionType(confirmPayloadResponse.action);
      setMessage(confirmPayloadResponse.payload);
      setActionInfo(tctPayload.payload);
      setConfirmationId(tctPayload.confirmation_id);
      if (isTctTokenInvalid) {
        setIsLoading(false);
        setIsRequestExpired(true);
        return;
      }
      const previousResponse = await data.getItem(`reqConId-${tctPayload.confirmation_id}`);
      if (previousResponse) {
        setActionStatus(previousResponse as ActionStatus);
      }

      setIsLoading(false);
    };

    initializeConfirmation();
  }, []);

  useEffect(() => {
    // Set a timeout of 65 seconds. if no action is taken the request has expired.
    if (!requestTimeoutId && actionStatus === ActionStatus.PENDING) {
      const id = setTimeout(() => {
        setIsRequestExpired(true);
      }, 65000);
      setRequestTimeoutId(id);
    } else if (requestTimeoutId && actionStatus !== ActionStatus.PENDING) {
      clearTimeout(requestTimeoutId as unknown as number); // Need to use browser timeout here not node timeout.
    }
    return () => {
      if (requestTimeoutId) clearTimeout(requestTimeoutId as unknown as number);
    };
  }, [actionStatus]);

  const completeAction = async (response: ConfirmResponse) => {
    setIsConfirming(true);
    getClientLogger().info(
      `Confirm Action: ${response === ConfirmResponse.Approved ? 'Approve' : 'Reject'} ${actionType} Button Clicked`,
    );
    await ConfirmActionService.completeConfirm(tempConfirmToken, apiKey, response);
    await data.setItem(`reqConId-${confirmationId}`, response);
    setActionStatus(response as unknown as ActionStatus);
    if (!isMobileSdk()) window.close();
    else setIsConfirming(false);
  };
  useEffect(() => {
    if (isRequestExpired && actionType === ConfirmActionType.TransferTransaction) {
      router.replace(NFT_TRANSFER_ROUTES.EXPIRED);
    }
  }, [actionType, isRequestExpired]);
  return (
    <Page backgroundType="solid" isOpen={isThemeLoaded}>
      {isRequestExpired && actionType !== ConfirmActionType.TransferTransaction ? (
        <>
          <Page.Icon>
            <ClientAssetLogo assetUri={assetUri} />
          </Page.Icon>
          <Page.Content>
            <VStack w="full" textAlign="center">
              <Text size="lg" fontWeight="semibold">
                {t('You ran out of time to confirm the signature.')} <br />
              </Text>
              <Text>
                {t('Please go back to {{appName}} and sign the request again.', {
                  appName: appName || 'the original window',
                })}
              </Text>
            </VStack>
          </Page.Content>
          <PageFooter />
        </>
      ) : (
        <>
          {isLoading ? (
            <Page.Content>
              <VStack gap={3} my={3} height="200px" justifyContent="center">
                <LoadingSpinner />
              </VStack>
            </Page.Content>
          ) : (
            <>
              <Page.Icon>
                <ClientAssetLogo assetUri={assetUri} />
              </Page.Icon>
              <Page.Content>
                {actionType === ConfirmActionType.SignMessage && (
                  <SignMessageDetails
                    appName={appName}
                    requestDomain={tctPayloadState.payload?.request_domain}
                    actionStatus={actionStatus}
                    message={payloadState}
                  />
                )}

                {actionType === ConfirmActionType.SendTransaction && (
                  <SendTransactionDetails
                    appName={appName}
                    transactionType={actionInfo.transaction_type}
                    tokenAmount={actionInfo.token_amount}
                    symbol={actionInfo.symbol}
                    fiatValue={actionInfo.fiat_value}
                    amount={actionInfo.amount}
                    currency={actionInfo.token}
                    from={actionInfo.from}
                    to={actionInfo.to}
                    actionStatus={actionStatus}
                  />
                )}

                {actionType === ConfirmActionType.ConfirmTransaction && (
                  <ConfirmTransactionDetails
                    toAddress={actionInfo.to}
                    blockExplorer={actionInfo.chain_info_uri}
                    networkName={actionInfo.network_label}
                  />
                )}

                {actionType === ConfirmActionType.TransferTransaction && (
                  <CollectibleTransferPreview
                    contractAddress={actionInfo?.nft?.contract_address as string}
                    tokenId={actionInfo?.nft?.token_id as string}
                    count={actionInfo?.nft?.quantity as number}
                    to={actionInfo.to as string}
                  />
                )}

                {actionStatus === ActionStatus.PENDING && (
                  <>
                    <Spacer flex={4} />
                    <HStack w="full" gap={2}>
                      <Button
                        label={t('Cancel')}
                        variant="neutral"
                        expand
                        onPress={() => completeAction(ConfirmResponse.Rejected)}
                      />
                      <Button
                        label={t('Confirm')}
                        variant="primary"
                        expand
                        disabled={isConfirming}
                        validating={isConfirming}
                        onPress={() => completeAction(ConfirmResponse.Approved)}
                      />
                    </HStack>
                  </>
                )}
              </Page.Content>
            </>
          )}
          <PageFooter />
        </>
      )}
    </Page>
  );
}
