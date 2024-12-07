/* istanbul ignore file */

'use client';

import KernelClientService from '@app/passport/libs/tee/kernel-client';
import { NftImagePreview } from '@app/passport/rpc/eth/(components)/nft-image';
import TransactionHeader from '@app/passport/rpc/eth/(components)/transaction-header';
import PassportLoadingSpinner from '@app/passport/rpc/user/components/passport-loading-spinner';
import { usePassportRouter } from '@hooks/common/passport-router';
import { usePassportStore } from '@hooks/data/passport/store';
import { useSmartAccount } from '@hooks/passport/use-smart-account';
import { useTranslation } from '@lib/common/i18n';
import { AnimatedCheckmark, AnimatedDismiss, PassportPage, Text } from '@magiclabs/ui-components';
import { Center, Spacer, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { Network } from 'magic-passport/types';
import { bundlerActions, ENTRYPOINT_ADDRESS_V07 } from 'permissionless';
import { EntryPoint } from 'permissionless/types';
import { FC, useEffect, useState } from 'react';

export enum TransactionStatusStates {
  SENDING,
  EXECUTING,
  COMPLETED,
  ERROR,
}

interface TransactionStatusProps {
  hash?: string | null;
  isTransactionActive?: boolean;
  onTransactionError?: (error: unknown) => void;
  onTransactionSuccess?: (receipt: unknown) => void;
  stateOverride?: TransactionStatusStates;
  nftData?: {
    imageUrl: string;
    name: string;
  };
}

export const PassportTransactionStatus: FC<TransactionStatusProps> = ({
  hash,
  isTransactionActive,
  onTransactionError,
  onTransactionSuccess,
  stateOverride,
  nftData,
}) => {
  const { t } = useTranslation('passport');
  const router = usePassportRouter();
  const network = usePassportStore(state => state.decodedQueryParams.network) as Network;
  const [receipt, setReceipt] = useState<null | unknown>(null);
  const [error, setError] = useState<null | unknown>(null);
  const { smartAccount } = useSmartAccount();

  const getTransactionStatus = () => {
    if (error) {
      return TransactionStatusStates.ERROR;
    }
    if (isTransactionActive) {
      if (!hash) {
        return TransactionStatusStates.SENDING;
      }
      if (hash && !receipt) {
        return TransactionStatusStates.EXECUTING;
      }
      if (hash && receipt) {
        return TransactionStatusStates.COMPLETED;
      }
    }
    return null;
  };

  const [transactionState, setTransactionState] = useState<TransactionStatusStates | null>(getTransactionStatus());

  useEffect(() => {
    setTransactionState(stateOverride ?? getTransactionStatus());
  }, [isTransactionActive, hash, receipt, error, stateOverride]);

  const getTransactionReceipt = async () => {
    try {
      setError(null);
      if (!smartAccount) throw new Error('Failed to get transaction receipt: Failed to get smart account');

      const kernelClient = KernelClientService.getSingleChainKernelClient({ smartAccount, network });
      if (!kernelClient) throw new Error('Failed to get transaction receipt: Failed to get CAB kernel client');

      const bundlerClient = kernelClient.extend(bundlerActions(ENTRYPOINT_ADDRESS_V07 as EntryPoint));
      if (bundlerClient) {
        const userOpReceipt = await bundlerClient.waitForUserOperationReceipt({
          hash: hash as `0x${string}`,
          timeout: 100_000_000,
        });
        if (!userOpReceipt.success) {
          setError('User operation failed');
        }
        setReceipt(userOpReceipt);
        onTransactionSuccess?.(receipt);
      }
    } catch (e) {
      setError(e);
      onTransactionError?.(e);
    }
  };

  useEffect(() => {
    if (hash && smartAccount) {
      getTransactionReceipt();
    }
  }, [hash, smartAccount]);

  if (transactionState === null) return null;

  const routeToNftViewer = () => {
    router.replace('/passport/rpc/wallet/magic_passport_wallet_nfts');
  };

  const routeToWalletHome = () => {
    router.replace('/passport/rpc/wallet/magic_passport_wallet');
  };

  return (
    <PassportPage>
      <TransactionHeader />
      {transactionState === TransactionStatusStates.COMPLETED && (
        <>
          <PassportPage.Content>
            <VStack>
              {nftData?.imageUrl ? (
                <NftImagePreview nftImage={nftData.imageUrl} size={120} center isLoading={false} />
              ) : (
                <Center mt="10vh">
                  <AnimatedCheckmark />
                </Center>
              )}
              <Spacer size="2" />
              <Text.H3>{t('Transaction Complete')}</Text.H3>
              <Text size="md" styles={{ color: token('colors.text.tertiary'), textAlign: 'center', maxWidth: '16rem' }}>
                {nftData
                  ? `${nftData.name || t('Your NFT')} ${t('now available in your')}`
                  : t('You can manage your assets any time in your')}{' '}
                <span
                  onClick={routeToWalletHome}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      routeToWalletHome();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    color: token('colors.text.primary'),
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {t('Magic Passport')}
                </span>
              </Text>
            </VStack>
          </PassportPage.Content>
          <PassportPage.Cancel
            label={nftData ? t('View') : t('My Passport')}
            onPress={nftData ? routeToNftViewer : routeToWalletHome}
          />
          <PassportPage.Confirm label={t('Close')} onPress={window.close} />
        </>
      )}
      {transactionState === TransactionStatusStates.EXECUTING && (
        <PassportPage.Content>
          <PassportLoadingSpinner text={t('Transaction in progress')} />
        </PassportPage.Content>
      )}
      {transactionState === TransactionStatusStates.SENDING && (
        <PassportPage.Content>
          <PassportLoadingSpinner text={t('Sending Transaction')} />
        </PassportPage.Content>
      )}
      {transactionState === TransactionStatusStates.ERROR && (
        <>
          <PassportPage.Content>
            <Center mt="25vh">
              <AnimatedDismiss />
            </Center>
            <Spacer size="2" />
            <Text>{t('Transaction Failed')}</Text>
          </PassportPage.Content>
          <PassportPage.Confirm label={t('Close')} onPress={window.close} />
        </>
      )}
    </PassportPage>
  );
};
