/* istanbul ignore file */

import { CurrencyFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/currency-formatter';
import { TokenFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/token-formatter';
import { useChainInfo } from '@hooks/common/chain-info';
import { getFiatValue } from '@lib/ledger/evm/utils/bn-math';
import { IcoQuestionCircleFill, Text, Tooltip } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { formatUnits, getBigInt } from 'ethers';

interface ConstructTransactionNetworkFeeProps {
  networkFeeInWei: string;
  isInputFormatFiat: boolean;
  price: string;
}

export default function ConstructTransactionNetworkFee({
  networkFeeInWei,
  isInputFormatFiat,
  price,
}: ConstructTransactionNetworkFeeProps) {
  const { chainInfo } = useChainInfo();
  return (
    <>
      <Box
        className={css({
          width: '100%',
          maxWidth: '25rem',
          height: '1px',
          backgroundColor: 'text.tertiary/20',
          marginTop: '1.2rem',
          marginBottom: '0.3rem',
        })}
      />
      <HStack w="100%" maxWidth={'25rem'} justifyContent="space-between" mb="1rem">
        <HStack>
          <Text size="sm" styles={{ fontWeight: 500 }}>
            Network Fee (estimated)
          </Text>
          <Tooltip content="This processing fee applies to all blockchain transactions. Prices vary based on network traffic.">
            <IcoQuestionCircleFill width={14} height={14} color={token('colors.ink.50')} />
          </Tooltip>
        </HStack>
        {networkFeeInWei ? (
          <Text size="sm">
            {isInputFormatFiat ? (
              <CurrencyFormatter value={getFiatValue(getBigInt(networkFeeInWei), price || '0')} />
            ) : (
              <TokenFormatter value={Number(formatUnits(networkFeeInWei.toString()))} token={chainInfo?.currency} />
            )}
          </Text>
        ) : null}
      </HStack>
    </>
  );
}
