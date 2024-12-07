'use client';

import { TokenFormatter } from '@app/send/rpc/eth/eth_sendTransaction/__components__/token-formatter';
import { useChainInfo } from '@hooks/common/chain-info';
import { useEthereumProxy } from '@hooks/common/ethereum-proxy';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useTranslation } from '@lib/common/i18n';
import { IconMagicLogo, Text } from '@magiclabs/ui-components';
import { Box, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { formatUnits } from 'ethers';
import { useLayoutEffect, useState } from 'react';

export default function WalletBalanceBanner() {
  const { chainInfo } = useChainInfo();
  const { getBalance } = useEthereumProxy();
  const { userMetadata } = useUserMetadata();
  const [balance, setBalance] = useState<string | undefined>(undefined);
  const { t } = useTranslation('send');

  useLayoutEffect(() => {
    if (!userMetadata?.publicAddress || !chainInfo) return;
    getBalance(userMetadata.publicAddress)
      .then((balanceInWei: string) => {
        setBalance(formatUnits(balanceInWei));
      })
      .catch(e => {
        logger.error('Failed to get balance', e);
      });
  }, [userMetadata, chainInfo]);

  return (
    <Box height={'3rem'}>
      <HStack
        justifyContent="space-between"
        w="100%"
        p="0 1rem"
        h="3rem"
        borderTop="1px solid"
        borderColor="text.tertiary/20"
        borderBottom="1px solid"
        position="absolute"
        top="3.8rem"
        left="0"
      >
        <HStack>
          <IconMagicLogo width={24} height={24} />
          <Text>{t('Magic Wallet')}</Text>
        </HStack>
        <Text styles={{ color: token('colors.text.tertiary') }}>
          {balance ? <TokenFormatter token={chainInfo?.currency || 'ETH'} value={Number(balance || '0')} /> : null}
        </Text>
      </HStack>
    </Box>
  );
}
