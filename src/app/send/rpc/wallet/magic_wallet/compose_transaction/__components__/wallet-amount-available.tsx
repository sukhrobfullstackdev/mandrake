/* istanbul ignore file */

import Erc20TokenAmountAvailable from '@app/send/rpc/wallet/magic_wallet/compose_transaction/__components__/erc20-amount-available';
import NativeTokenAmountAvailable from '@app/send/rpc/wallet/magic_wallet/compose_transaction/__components__/native-token-amount-available';

interface WalletAmountAvailableProps {
  contractAddress: string | undefined;
  symbol: string | undefined;
  balance: string | undefined;
  decimals: number | undefined;
  logo: string | undefined;
  isInputFormatFiat: boolean;
  balanceInUsd: number;
  balanceInWei: number;
}

export default function WalletAmountAvailable({
  contractAddress,
  symbol,
  decimals,
  logo,
  balance,
  isInputFormatFiat,
  balanceInWei,
  balanceInUsd,
}: WalletAmountAvailableProps) {
  return (
    <div>
      {contractAddress && (
        <Erc20TokenAmountAvailable
          logo={logo || ''}
          decimals={decimals || 18}
          balance={balance || '0'}
          symbol={symbol || ''}
        />
      )}
      {!contractAddress && (
        <NativeTokenAmountAvailable
          isInputFormatFiat={isInputFormatFiat}
          balanceInUsd={balanceInUsd}
          balanceInWei={balanceInWei}
        />
      )}
    </div>
  );
}
