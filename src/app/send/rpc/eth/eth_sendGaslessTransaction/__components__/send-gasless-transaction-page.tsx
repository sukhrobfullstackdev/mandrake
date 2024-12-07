'use client';

import { AwsCredentialIdentity } from '@aws-sdk/types';
import { WalletInfo, WalletType } from '@custom-types/wallet';
import { useGaslessTransaction } from '@hooks/blockchain/ethereum/send-gasless-transaction';
import { useChainInfo } from '@hooks/common/chain-info';
import { useAssetUri } from '@hooks/common/client-config';
import { useConfirmAction } from '@hooks/common/confirm-action';
import { getWalletInfoAndCredentials } from '@hooks/common/hydrate-or-create-wallets/wallet-info-and-credentials';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { ConfirmActionType } from '@hooks/data/embedded/confirm-action';
import { useGaslessTransactionStatusPollerQuery } from '@hooks/data/embedded/gasless-transactions';
import { useStore } from '@hooks/store';
import { useTranslation } from '@lib/common/i18n';
import truncateAddress from '@lib/utils/truncate-address';
import { JsonRpcRequestPayload } from '@magic-sdk/types';
import { Button, ClientAssetLogo, Page, Text, Tooltip } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ISendGaslessTransactionPageProps {
  publicAddress: string;
  activeRpcPayload: JsonRpcRequestPayload;
}

export const SendGaslessTransactionUI = ({ activeRpcPayload, publicAddress }: ISendGaslessTransactionPageProps) => {
  const { t } = useTranslation('send');
  const { sendGaslessTransaction } = useGaslessTransaction();
  const { chainInfo } = useChainInfo();
  const assetUri = useAssetUri();
  const blockExplorer = chainInfo?.blockExplorer || '';
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const toAddress = activeRpcPayload?.params[1]?.to || '';
  const [requestId, setRequestId] = useState<string | null>(null);
  const [credentialsData, setCredentialsData] = useState<AwsCredentialIdentity>();
  const [walletInfoData, setWalletInfoData] = useState<WalletInfo>();

  const { authUserId, authUserSessionToken } = useStore(state => state);

  const { doConfirmActionIfRequired, isActionConfirmed, isActionConfirmationExpired, isSkipConfirmAction } =
    useConfirmAction();

  const { data: response, error: pollerError } = useGaslessTransactionStatusPollerQuery(
    {
      requestId: requestId as string,
    },
    {
      enabled: !!requestId,
      refetchInterval: 3000, // Poll every 3 seconds
      refetchIntervalInBackground: true,
    },
  );

  useEffect(() => {
    if (response) {
      if (response.state === 'COMPLETED') {
        resolveActiveRpcRequest({
          success: true,
          request_id: requestId,
          state: response.state,
        });
        setIsLoading(false);
      } else if (response.state === 'FAILED') {
        setIsLoading(false);
        setErrorMessage(t('Transaction failed. Please try again.'));
      }
    }
  }, [response, requestId, resolveActiveRpcRequest]);

  useEffect(() => {
    if (pollerError) {
      setIsLoading(false);
      logger.error('Error polling transaction state', pollerError);
      setErrorMessage(t('Error checking transaction status. Please try again.'));
    }
  }, [pollerError]);

  const handleGaslessTransaction = async () => {
    if (!credentialsData || !walletInfoData) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const gasApiResponse = await sendGaslessTransaction({
        activeRpcPayload,
        publicAddress,
        credentialsData,
        walletInfoData,
      });
      setRequestId(gasApiResponse.requestId);
    } catch (error) {
      setIsLoading(false);
      logger.error('Error sending gasless transaction from UI', error);
      setErrorMessage(t('Something went wrong. Please try again.'));
    }
  };

  const onConfirmSignature = async () => {
    if (!authUserId || !authUserSessionToken) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { awsCreds, walletInfoData: walletInfo } = await getWalletInfoAndCredentials({
        authUserId,
        authUserSessionToken,
        walletType: WalletType.ETH,
      });
      setCredentialsData(awsCreds);
      setWalletInfoData(walletInfo);
      doConfirmActionIfRequired({
        action: ConfirmActionType.ConfirmTransaction,
        payload: {
          chain_info_uri: chainInfo?.blockExplorer,
          network_label: chainInfo?.networkName,
          to: toAddress,
        },
      });
    } catch {
      setIsLoading(false);
      setErrorMessage(t('An error occurred. Please try again.'));
    }
  };

  useEffect(() => {
    if (isActionConfirmed || isSkipConfirmAction) handleGaslessTransaction();
    if (isActionConfirmationExpired) setIsLoading(false);
  }, [isActionConfirmed, isActionConfirmationExpired, isSkipConfirmAction]);

  return (
    <Page.Content>
      <VStack mb="1.6rem" mt="0.5rem">
        <Box mb="0.5rem">
          <ClientAssetLogo assetUri={assetUri} />
        </Box>
        <Text.H4>{t('Confirm Transaction')}</Text.H4>
      </VStack>
      <Box w="100%" maxW="25rem" mb="1.4rem">
        <HStack justifyContent={'space-between'}>
          <Text size="sm">{t('Send to')}</Text>
          <Tooltip width="max-content" content="View Address Details">
            <Link
              target="_blank"
              id="from-address-link"
              href={`${blockExplorer}/address/${toAddress}`}
              rel="noreferrer"
            >
              <Text variant="text" size="sm" styles={{ color: token('colors.text.tertiary') }}>
                {truncateAddress(toAddress)}
              </Text>
            </Link>
          </Tooltip>
        </HStack>
        <Box
          className={css({
            width: '100%',
            height: '1px',
            backgroundColor: 'text.tertiary/20',
            margin: '0.7rem 0',
          })}
        />
        <HStack justifyContent={'space-between'}>
          <Text size="sm">{t('Network')}</Text>
          <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
            {chainInfo?.networkName}
          </Text>
        </HStack>
        <Box
          className={css({
            width: '100%',
            height: '1px',
            backgroundColor: 'text.tertiary/20',
            margin: '0.7rem 0',
          })}
        />
        <HStack justifyContent={'space-between'}>
          <Text size="sm">{t('Network fee')}</Text>
          <Text size="sm" variant="info">
            {t('Free')}
          </Text>
        </HStack>
      </Box>
      <Button expand disabled={isLoading} validating={isLoading} onPress={onConfirmSignature} label={t('Confirm')} />
      {errorMessage ? <Text variant="error">{errorMessage}</Text> : null}
    </Page.Content>
  );
};
