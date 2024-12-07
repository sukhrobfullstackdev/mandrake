'use client';

import SendTxTokenLogo from '@app/send/rpc/eth/eth_sendTransaction/__components__/send-tx-token-logo';
import TransactionSendAmount from '@app/send/rpc/eth/eth_sendTransaction/__components__/transaction-send-amount';
import TransactionStatus from '@app/send/rpc/eth/eth_sendTransaction/__components__/transaction-status';
import TransactionToFromAddresses from '@app/send/rpc/eth/eth_sendTransaction/__components__/transaction-to-from-addresses';
import WalletBalanceBanner from '@app/send/rpc/eth/eth_sendTransaction/__components__/wallet-balance-banner';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { TransactionType } from '@lib/utils/transaction-utils';
import { Button, Page, Text } from '@magiclabs/ui-components';
import { Box, Spacer, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useSearchParams } from 'next/navigation';

export default function PendingTransactionPage() {
  const searchParams = useSearchParams();
  const { t } = useTranslation('send');
  const transactionType = decodeURIComponent(searchParams.get('transactionType') as string).trim() as TransactionType;
  const transactionValueInFiat = decodeURIComponent(searchParams.get('transactionValueInFiat') || '');
  const toAddress = decodeURIComponent(searchParams.get('to') as string);
  const fromAddress = decodeURIComponent(searchParams.get('from') as string);
  const hash = decodeURIComponent(searchParams.get('hash') as string);
  const symbol = decodeURIComponent(searchParams.get('symbol') || '');
  const amount = decodeURIComponent(searchParams.get('amount') || '');
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const method = activeRpcPayload?.method;
  const closeButtonLabel = method === 'eth_sendTransaction' ? t('Close') : t('Back to wallet');
  const router = useSendRouter();

  const handleClose = () => {
    if (method === 'magic_wallet') {
      return router.replace('/send/rpc/wallet/magic_wallet');
    }
    IFrameMessageService.hideOverlay();
    router.replace('/send/idle');
  };

  return (
    <Page.Content>
      <WalletBalanceBanner />
      <SendTxTokenLogo isErc20Token={transactionType === 'erc20-transfer'} />
      {transactionType === 'erc20-transfer' ? (
        <TransactionSendAmount type={transactionType} amount={amount} symbol={symbol} />
      ) : null}
      {transactionType === 'eth-transfer' ? (
        <TransactionSendAmount type={transactionType} value={Number(transactionValueInFiat)} />
      ) : null}
      <Spacer size="2" />
      <TransactionToFromAddresses
        to={toAddress.trim()}
        from={fromAddress}
        isErc20Transfer={transactionType === 'erc20-transfer'}
      />
      <Box mt={'0.8rem'}>
        <TransactionStatus hash={hash} />
      </Box>
      <VStack m={'4'}>
        <Text size="xs" styles={{ color: token('colors.text.tertiary'), textAlign: 'center' }}>
          {t('Transfers take about 30 seconds.')}
          <br />
          {t('You can leave this page.')}
        </Text>
      </VStack>
      <Button expand variant="primary" onPress={handleClose} label={closeButtonLabel} />
    </Page.Content>
  );
}
