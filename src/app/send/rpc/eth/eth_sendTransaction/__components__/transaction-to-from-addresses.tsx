import { useChainInfo } from '@hooks/common/chain-info';
import { useTranslation } from '@lib/common/i18n';
import truncateAddress from '@lib/utils/truncate-address';
import { IcoArrowRight, Text, Tooltip } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Link from 'next/link';

type ToFromAddressesProps = {
  to: string;
  from: string;
  isErc20Transfer?: boolean;
};

export default function TransactionToFromAddresses({ to, from, isErc20Transfer = false }: ToFromAddressesProps) {
  const { chainInfo } = useChainInfo();
  const blockExplorer = chainInfo?.blockExplorer || '';
  const { t } = useTranslation('send');

  return (
    <HStack alignItems="center">
      <Box>
        {from ? (
          <Tooltip width="max-content" content="View Address Details">
            <Link target="_blank" id="from-address-link" href={`${blockExplorer}/address/${from}`} rel="noreferrer">
              <Text variant="text" size="md" styles={{ fontWeight: 'bold' }}>
                {truncateAddress(from)}
              </Text>
            </Link>
          </Tooltip>
        ) : null}
      </Box>
      <IcoArrowRight height={20} width={20} color={token('colors.ink.40')} className={css({ margin: '0 0.6rem' })} />
      <Box>
        {to && to !== 'undefined' ? (
          <Tooltip width="max-content" content="View Address Details">
            <Link target="_blank" id="to-address-link" href={`${blockExplorer}/address/${to}`} rel="noreferrer">
              <Text variant="text" size="md" styles={{ fontWeight: 'bold' }}>
                {truncateAddress(to)}
              </Text>
            </Link>
          </Tooltip>
        ) : null}
        {(!to || to === 'undefined') && from && !isErc20Transfer ? (
          <Text variant="text" size="md" styles={{ fontWeight: 'bold' }}>
            {t('Contract Creation')}
          </Text>
        ) : null}
      </Box>
    </HStack>
  );
}
