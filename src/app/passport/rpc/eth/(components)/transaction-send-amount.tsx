import ClickableTransactionRow from '@app/passport/components/clickable-transaction-row/clickable-transaction-row';
import { getTotalValueInWei } from '@app/passport/libs/format_data_field';
import { DrawerTokenMetadata } from '@lib/utils/token';
import { IcoAlertCircleFill } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';
import { CallEncoded, CallUnencoded } from 'magic-passport/types';

interface SendTransactionRowProps {
  calls: (CallEncoded | CallUnencoded)[] | null;
  sendAmountTokenFormatted: string;
  sendAmountUsdFormatted: string;
  hasEnoughForSendAmount: boolean;
  selectedSendToken: DrawerTokenMetadata;
  onPress: () => void;
}

function TransactionSendAmount({
  calls,
  sendAmountTokenFormatted,
  sendAmountUsdFormatted,
  hasEnoughForSendAmount,
  selectedSendToken,
  onPress,
}: SendTransactionRowProps) {
  if (!calls || getTotalValueInWei(calls) === BigInt(0)) return null;

  const variant = 'send';
  const isLoading = !sendAmountTokenFormatted || !sendAmountUsdFormatted;
  const primaryText = sendAmountTokenFormatted;
  const secondaryText = sendAmountUsdFormatted;
  const tokenIcon = hasEnoughForSendAmount ? (
    selectedSendToken.icon
  ) : (
    <IcoAlertCircleFill color={token('colors.negative.base')} />
  );

  return (
    <ClickableTransactionRow
      variant={variant}
      isLoading={isLoading}
      primaryText={primaryText}
      secondaryText={secondaryText}
      tokenIcon={tokenIcon}
      onPress={onPress}
    />
  );
}

export default TransactionSendAmount;
