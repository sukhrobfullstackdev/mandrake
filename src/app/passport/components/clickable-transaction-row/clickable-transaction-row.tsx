/* istanbul ignore file */
import { Callout, TransactionRow } from '@magiclabs/ui-components';
import { ReactNode } from 'react';

const ClickableTransactionRow = ({
  variant,
  tokenIcon,
  primaryText,
  secondaryText,
  onPress,
  isLoading,
  error,
}: {
  variant: 'send' | 'receive' | 'networkFee' | 'spendingCap';
  tokenIcon: ReactNode;
  primaryText: string;
  secondaryText: string;
  onPress: () => void;
  isLoading: boolean;
  error?: string | null;
}) => {
  return (
    <>
      <TransactionRow
        variant={variant}
        primaryText={primaryText}
        secondaryText={secondaryText}
        onPress={onPress}
        loading={isLoading}
      >
        <TransactionRow.TokenIcon>
          <TransactionRow.TokenIcon>{tokenIcon}</TransactionRow.TokenIcon>
        </TransactionRow.TokenIcon>
      </TransactionRow>
      {error ? <Callout variant="error" size="md" label={error} /> : null}
    </>
  );
};

export default ClickableTransactionRow;
