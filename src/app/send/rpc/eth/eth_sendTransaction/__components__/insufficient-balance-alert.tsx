import { useCurrencyFormatter } from '@hooks/common/currency-formatter';
import { useSendRouter } from '@hooks/common/send-router';
import { useTokenFormatter } from '@hooks/common/token-formatter';
import { useTranslation } from '@lib/common/i18n';
import { getFiatValue } from '@lib/ledger/evm/utils/bn-math';
import { Callout } from '@magiclabs/ui-components';
import { formatUnits } from 'ethers';

interface InsufficientBalanceAlertProps {
  amountInWei: bigint;
  token: string;
  price: string;
}

export default function InsufficientBalanceAlert({ amountInWei, token, price }: InsufficientBalanceAlertProps) {
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const formattedAmount = useTokenFormatter({ value: Number(formatUnits(amountInWei)), token });
  const formattedPrice = useCurrencyFormatter({ value: Number(getFiatValue(amountInWei, price)) });
  return (
    <Callout
      variant="warning"
      label={t('Please add at least {{amount}} ({{price}}) to continue.', {
        amount: formattedAmount,
        price: formattedPrice,
      })}
      onPress={() => router.replace('/send/rpc/eth/eth_sendTransaction/select_fiat_onramp')}
    />
  );
}
