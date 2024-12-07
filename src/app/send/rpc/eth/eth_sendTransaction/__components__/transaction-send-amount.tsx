import { CurrencyFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/currency-formatter';
import { TokenFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/token-formatter';
import { SwitchCase } from '@app/send/rpc/nft/magic_nft_checkout/__components__/switch-case';
import { useTranslation } from '@lib/common/i18n';
import { isStabilityProtocol } from '@lib/utils/stability-protocol';
import { TransactionType } from '@lib/utils/transaction-utils';
import { LoadingSpinner, Text } from '@magiclabs/ui-components';

interface TransactionProps {
  type: TransactionType;
  value?: number;
  amount?: string;
  symbol?: string;
}

export default function TransactionSendAmount({ type, value, amount, symbol }: TransactionProps) {
  const { t } = useTranslation('send');

  if (isStabilityProtocol()) {
    return <Text.H3>{t('Free Transaction!')}</Text.H3>;
  }

  return (
    <SwitchCase
      value={type}
      defaultComponent={<></>}
      caseBy={{
        'eth-transfer': (
          <Text.H1>
            {value !== undefined ? <CurrencyFormatter value={value} /> : <LoadingSpinner size={38} strokeWidth={4} />}
          </Text.H1>
        ),
        'erc20-transfer': (
          <Text.H2>
            {amount && symbol ? (
              <TokenFormatter value={Number(amount)} token={symbol} />
            ) : (
              <LoadingSpinner size={38} strokeWidth={4} />
            )}
          </Text.H2>
        ),
      }}
    />
  );
}
