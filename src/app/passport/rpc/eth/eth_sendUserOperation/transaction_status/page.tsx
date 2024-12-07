/* istanbul ignore file */

'use client';

import KernelClientService from '@app/passport/libs/tee/kernel-client';
import TransactionHeader from '@app/passport/rpc/eth/(components)/transaction-header';
import PassportCheckmark from '@app/passport/rpc/user/components/passport-checkmark';
import PassportLoadingSpinner from '@app/passport/rpc/user/components/passport-loading-spinner';
import { usePassportStore } from '@hooks/data/passport/store';
import { useSmartAccount } from '@hooks/passport/use-smart-account';
import { PassportPage, Text } from '@magiclabs/ui-components';
import { Spacer } from '@styled/jsx';
import { Network } from 'magic-passport/types';
import useTranslation from 'next-translate/useTranslation';
import { useSearchParams } from 'next/navigation';
import { bundlerActions, ENTRYPOINT_ADDRESS_V07 } from 'permissionless';
import { EntryPoint } from 'permissionless/types';
import { useEffect, useState } from 'react';

export default function TransactionStatus() {
  const { t } = useTranslation('passport');
  const hash = useSearchParams().get('hash');
  const network = usePassportStore(state => state.decodedQueryParams.network) as Network;
  const [receipt, setReceipt] = useState(false);
  const { smartAccount } = useSmartAccount();

  const getTransactionReceipt = async () => {
    try {
      if (!smartAccount) throw new Error('Smart account not found');
      const kernelClient = KernelClientService.getSingleChainKernelClient({ smartAccount, network });
      if (!kernelClient) return;
      const bundlerClient = kernelClient.extend(bundlerActions(ENTRYPOINT_ADDRESS_V07 as EntryPoint));
      if (bundlerClient) {
        await bundlerClient.waitForUserOperationReceipt({
          hash: hash as `0x${string}`,
          timeout: 100_000_000,
        });
        setReceipt(true);
      }
    } catch (error) {
      console.log('Error getting transaction receipt', error);
    }
  };

  useEffect(() => {
    if (smartAccount) {
      getTransactionReceipt();
    }
  }, [smartAccount]);

  return (
    <PassportPage>
      <TransactionHeader />
      <PassportPage.Content>
        {receipt ? (
          <>
            <PassportCheckmark />
            <Spacer size="2" />
            <Text>{t('Transaction complete')}</Text>
          </>
        ) : (
          <PassportLoadingSpinner text={t('Transaction in progress')} />
        )}
      </PassportPage.Content>
    </PassportPage>
  );
}
