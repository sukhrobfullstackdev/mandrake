import { CurrencyFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/currency-formatter';
import { TokenFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/token-formatter';
import { WalletType } from '@custom-types/wallet';
import { useChainInfo } from '@hooks/common/chain-info';
import { IcoQuestionCircleFill, IcoWarningFill, LoadingSpinner, Text, Tooltip } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { formatUnits } from 'ethers';

interface TransactionLineItemsProps {
  amountWei: string | undefined;
  amountUsd: string | undefined;
  networkFeeWei: string | undefined;
  networkFeeUsd: string | undefined;
  totalWei: string | undefined;
  totalUsd: string | undefined;
  isErc20Transfer?: boolean;
  insufficientFunds?: boolean;
}

export default function TransactionLineItems({
  amountWei,
  amountUsd,
  networkFeeWei,
  networkFeeUsd,
  totalWei,
  totalUsd,
  isErc20Transfer,
  insufficientFunds,
}: TransactionLineItemsProps) {
  const { chainInfo } = useChainInfo();

  return (
    <VStack w="100%">
      {/* Send Amount */}
      {!isErc20Transfer ? (
        <HStack w="100%" justifyContent="space-between">
          <Text size="sm">Send Amount</Text>
          <HStack>
            {amountWei && amountUsd ? (
              <>
                <Text size="sm" variant="text" styles={{ color: token('colors.text.tertiary') }}>
                  <TokenFormatter
                    value={Number(formatUnits(amountWei))}
                    token={chainInfo?.currency || WalletType.ETH}
                  />
                </Text>
                <Text size="sm" variant="text" styles={{ fontWeight: 'bold' }}>
                  <CurrencyFormatter value={Number(amountUsd)} />
                </Text>
              </>
            ) : (
              <LoadingSpinner aria-label="loading-spinner" size={16} strokeWidth={2} />
            )}
          </HStack>
        </HStack>
      ) : null}

      {/* Network Fee */}
      <HStack
        className={css({
          width: '100%',
          justifyContent: 'space-between',
        })}
      >
        <HStack>
          <Text size="sm">Network Fee</Text>
          <Tooltip content="This processing fee applies to all blockchain transactions. Prices vary based on network traffic.">
            <IcoQuestionCircleFill width={14} height={14} color={token('colors.ink.50')} />
          </Tooltip>
        </HStack>
        <HStack>
          {networkFeeWei && networkFeeUsd ? (
            <>
              <Text size="sm" variant="text" styles={{ color: token('colors.text.tertiary') }}>
                <TokenFormatter
                  value={Number(formatUnits(networkFeeWei))}
                  token={chainInfo?.currency || WalletType.ETH}
                />
              </Text>
              <Text size="sm" variant="text" styles={{ fontWeight: 'bold' }}>
                <CurrencyFormatter value={Number(networkFeeUsd)} />
              </Text>
            </>
          ) : (
            <LoadingSpinner aria-label="loading-spinner" size={16} strokeWidth={2} />
          )}
        </HStack>
      </HStack>

      {/* Divider */}
      {!isErc20Transfer ? (
        <Box
          className={css({
            width: '100%',
            height: '1px',
            backgroundColor: 'text.tertiary/20',
            marginTop: '0.5rem',
          })}
        />
      ) : null}

      {/* Total */}
      {!isErc20Transfer ? (
        <HStack
          className={css({
            width: '100%',
            justifyContent: 'space-between',
          })}
        >
          <Text size="sm">Total</Text>
          <HStack>
            {totalWei && totalUsd ? (
              <HStack>
                <Text
                  size="sm"
                  styles={{ color: token(insufficientFunds ? 'colors.warning.base' : 'colors.text.tertiary') }}
                >
                  <TokenFormatter value={Number(formatUnits(totalWei))} token={chainInfo?.currency || WalletType.ETH} />
                </Text>
                <Text
                  size="sm"
                  styles={{
                    color: token(insufficientFunds ? 'colors.warning.base' : 'colors.text.primary'),
                    fontWeight: 'bold',
                  }}
                >
                  <CurrencyFormatter value={Number(totalUsd)} />
                </Text>
                {insufficientFunds ? (
                  <IcoWarningFill width={14} height={14} color={token('colors.warning.base')} />
                ) : null}
              </HStack>
            ) : (
              <LoadingSpinner aria-label="loading-spinner" size={16} strokeWidth={2} />
            )}
          </HStack>
        </HStack>
      ) : null}
    </VStack>
  );
}
