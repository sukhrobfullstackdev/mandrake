import { useChainInfo } from '@hooks/common/chain-info';
import { useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { IcoCheckmarkCircleFill, IcoExternalLink, LoadingSpinner, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Link from 'next/link';
import { useLayoutEffect, useState } from 'react';

export default function TransactionStatus({ hash }: { hash: string }) {
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const { chainInfo } = useChainInfo();
  const { getTransactionReceipt } = useEthereumProxy();

  useLayoutEffect(() => {
    if (!hash) return;

    const intervalId: NodeJS.Timeout = setInterval(async () => {
      try {
        const receipt = await getTransactionReceipt(hash);
        if (receipt) {
          setIsConfirmed(true);
          clearInterval(intervalId);
        }
      } catch (err) {
        logger.error('Error polling transaction receipt', err);
        clearInterval(intervalId);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [hash]);

  return (
    <VStack alignContent={'left'} alignItems={'left'}>
      <Link href={`${chainInfo?.blockExplorer}/tx/${hash}`} target="_blank" rel="noreferrer">
        <HStack className={css({ cursor: 'pointer' })}>
          <IcoCheckmarkCircleFill height={18} width={18} color={token('colors.brand.lighter')} />
          <Text variant="info" styles={{ fontWeight: '600' }}>
            Transfer Started
          </Text>
          <IcoExternalLink height={12} width={12} color={token('colors.brand.base')} />
        </HStack>
      </Link>
      {isConfirmed ? (
        <HStack>
          <IcoCheckmarkCircleFill height={18} width={18} color={token('colors.brand.lighter')} />
          <Text variant="info" styles={{ fontWeight: '600' }}>
            Transfer Complete
          </Text>
        </HStack>
      ) : (
        <HStack>
          <LoadingSpinner size={16} strokeWidth={2} />
          <Text>Sending Funds</Text>
        </HStack>
      )}
    </VStack>
  );
}
