import { PassportPage } from '@magiclabs/ui-components';

interface ConfirmButtonProps {
  isSending: boolean;
  networkFeeUsd: number | undefined;
  networkFeeNativeToken: string | undefined;
  networkFeeError: string | null;
  hasEnoughForFee: boolean;
  hasEnoughForSendAmount: boolean;
  onConfirm: () => void;
}

function TransactionConfirmButton({
  isSending,
  networkFeeUsd,
  networkFeeNativeToken,
  networkFeeError,
  hasEnoughForFee,
  hasEnoughForSendAmount,
  onConfirm,
}: ConfirmButtonProps) {
  const isDisabled =
    isSending ||
    !networkFeeUsd ||
    !networkFeeNativeToken ||
    Boolean(networkFeeError) ||
    !hasEnoughForFee ||
    !hasEnoughForSendAmount;

  return <PassportPage.Confirm label="Confirm" onPress={onConfirm} disabled={isDisabled} validating={isSending} />;
}

export default TransactionConfirmButton;
