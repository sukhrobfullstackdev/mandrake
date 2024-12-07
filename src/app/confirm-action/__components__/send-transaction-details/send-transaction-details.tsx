import { YouCanSafelyGoBackToApp } from '@app/confirm-action/__components__/sign-message-details/sign-message-details';
import SendTxTokenLogo from '@app/send/rpc/eth/eth_sendTransaction/__components__/send-tx-token-logo';
import TransactionSendAmount from '@app/send/rpc/eth/eth_sendTransaction/__components__/transaction-send-amount';
import TransactionToFromAddresses from '@app/send/rpc/eth/eth_sendTransaction/__components__/transaction-to-from-addresses';
import { ActionStatus } from '@custom-types/confirm-action';
import {
  ERC20_TRANSFER,
  ETH_TRANSFER,
  FLOW_USDC_TRANSFER,
  TOKEN_TRANSFER,
  TransactionType,
} from '@hooks/data/embedded/confirm-action';
import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { Spacer, VStack } from '@styled/jsx';
import { HStack } from '@styled/jsx/hstack';

interface Props {
  appName: string;
  transactionType: TransactionType;
  amount?: string;
  tokenAmount?: string;
  currency?: string;
  symbol?: string;
  fiatValue?: string;
  from?: string;
  to?: string;
  actionStatus: ActionStatus;
}

export const SendTransactionDetails = ({
  appName,
  transactionType,
  amount,
  currency,
  tokenAmount,
  symbol,
  fiatValue,
  from,
  to,
  actionStatus,
}: Props) => {
  const { t } = useTranslation('common');
  const isErc20Transfer = transactionType === ERC20_TRANSFER;

  if (actionStatus === ActionStatus.APPROVED) {
    return (
      <VStack alignItems="center" textAlign="center" gap={4}>
        <Text size="lg" styles={{ fontWeight: 500 }}>
          {t('Your transaction is being sent!')}
        </Text>
        <YouCanSafelyGoBackToApp appName={appName} />
      </VStack>
    );
  }

  if (actionStatus === ActionStatus.REJECTED) {
    return (
      <VStack textAlign="center" gap={4}>
        <Text size="lg" styles={{ fontWeight: 500 }}>
          {t('You rejected the transaction')}
        </Text>
        <YouCanSafelyGoBackToApp appName={appName} />
      </VStack>
    );
  }

  if (transactionType === ETH_TRANSFER) {
    return (
      <VStack alignItems="center" textAlign="center" gap={4}>
        <Text size="lg" styles={{ fontWeight: 500 }}>
          {t('Confirm your {{appName}} transaction', { appName })}
        </Text>
        <VStack alignItems="center" gap={0}>
          <TransactionSendAmount value={Number(fiatValue)} type={transactionType} />
          <HStack>
            <SendTxTokenLogo size={26} />
            <Text size="md" styles={{ fontWeight: 400 }}>
              {amount} {currency}
            </Text>
          </HStack>
        </VStack>
        <TransactionToFromAddresses to={to || ''} from={from || ''} />
        <Spacer size="2" />
      </VStack>
    );
  }

  if (
    transactionType === TOKEN_TRANSFER ||
    transactionType === FLOW_USDC_TRANSFER ||
    transactionType === ERC20_TRANSFER
  ) {
    return (
      <VStack alignItems="center" textAlign="center" gap={4}>
        <Text size="lg" styles={{ fontWeight: 500 }}>
          {t('Confirm your {{appName}} transaction', { appName })}
        </Text>
        <VStack alignItems="center" gap={4}>
          <HStack>
            <SendTxTokenLogo size={26} isErc20Token={isErc20Transfer} />
            <Text.H3>
              {tokenAmount} {symbol}
            </Text.H3>
          </HStack>
        </VStack>
        <TransactionToFromAddresses to={to || ''} from={from || ''} isErc20Transfer={isErc20Transfer} />
        <Spacer size="2" />
      </VStack>
    );
  }

  return (
    <VStack alignItems="center" textAlign="center" gap={4}>
      <Text size="lg" styles={{ fontWeight: 500 }}>
        {t('Confirm your {{appName}} transaction', { appName })}
      </Text>
      <TransactionToFromAddresses to={to || ''} from={from || ''} isErc20Transfer={isErc20Transfer} />
      <Spacer size="2" />
    </VStack>
  );
};
