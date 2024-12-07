import ClickableTransactionRow from '@app/passport/components/clickable-transaction-row/clickable-transaction-row';
import { useTranslation } from '@lib/common/i18n';
import { DrawerTokenMetadata } from '@lib/utils/token';
import { IcoAlertCircleFill } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';

interface TransactionNetworkFeeProps {
  selectedSendToken: DrawerTokenMetadata;
  isEstimatingNetworkFee: boolean;
  networkFeeNativeToken?: string;
  networkFeeAmountDisplay: string;
  networkFeeUsd?: number;
  networkFeeInUsdDisplay: string;
  networkFeeError: string | null;
  hasEnoughForFee: boolean;
  insufficientFundsError: string | null;
  setIsPayWithDrawerOpen: (isOpen: boolean) => void;
}

function TransactionNetworkFee({
  selectedSendToken,
  isEstimatingNetworkFee,
  networkFeeNativeToken,
  networkFeeAmountDisplay,
  networkFeeUsd,
  networkFeeInUsdDisplay,
  networkFeeError,
  hasEnoughForFee,
  insufficientFundsError,
  setIsPayWithDrawerOpen,
}: TransactionNetworkFeeProps) {
  const { t } = useTranslation('passport');

  const getDisplayValues = () => {
    if (selectedSendToken.isNativeToken) {
      return {
        fee: t('Free'),
        feeUsd: '',
      };
    }
    return {
      fee: networkFeeAmountDisplay,
      feeUsd: networkFeeInUsdDisplay,
    };
  };

  const { fee, feeUsd } = getDisplayValues();

  const isLoading = (!networkFeeError && (!networkFeeNativeToken || !networkFeeUsd)) || isEstimatingNetworkFee;
  const errorMessage = networkFeeError || insufficientFundsError;

  const tokenIcon =
    networkFeeError || !hasEnoughForFee ? (
      <IcoAlertCircleFill color={token('colors.negative.base')} />
    ) : (
      selectedSendToken.icon
    );

  const handlePress = () => {
    setIsPayWithDrawerOpen(true);
  };

  return (
    <ClickableTransactionRow
      variant="networkFee"
      primaryText={!isEstimatingNetworkFee ? (networkFeeError ? '-' : fee) : ''}
      secondaryText={!isEstimatingNetworkFee ? (networkFeeError ? '' : feeUsd) : ''}
      tokenIcon={tokenIcon}
      onPress={handlePress}
      isLoading={isLoading}
      error={errorMessage}
    />
  );
}

export default TransactionNetworkFee;
