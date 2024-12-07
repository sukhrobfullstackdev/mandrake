import { useTranslation } from '@lib/common/i18n';
import truncateAddress from '@lib/utils/truncate-address';
import { Text, Tooltip } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Link from 'next/link';

type Props = {
  toAddress?: string;
  blockExplorer?: string;
  networkName?: string;
};

export const ConfirmTransactionDetails = ({ toAddress = '', blockExplorer, networkName }: Props) => {
  const { t } = useTranslation('common');

  return (
    <VStack w="full" alignItems="center" textAlign="center" gap={9}>
      <Text.H4>{t('Confirm Transaction')}?</Text.H4>
      <Box w="100%" maxW="25rem" mb="1.4rem">
        <HStack justifyContent={'space-between'}>
          <Text size="sm">{t('Send to')}</Text>
          <Tooltip width="max-content" content="View Address Details">
            <Link
              target="_blank"
              id="from-address-link"
              href={`${blockExplorer}/address/${toAddress}`}
              rel="noreferrer"
            >
              <Text variant="text" size="sm" styles={{ color: token('colors.text.tertiary') }}>
                {truncateAddress(toAddress)}
              </Text>
            </Link>
          </Tooltip>
        </HStack>
        <Box
          className={css({
            width: '100%',
            height: '1px',
            backgroundColor: 'text.tertiary/20',
            margin: '0.7rem 0',
          })}
        />
        <HStack justifyContent={'space-between'}>
          <Text size="sm">{t('Network')}</Text>
          <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
            {networkName}
          </Text>
        </HStack>
        <Box
          className={css({
            width: '100%',
            height: '1px',
            backgroundColor: 'text.tertiary/20',
            margin: '0.7rem 0',
          })}
        />
        <HStack justifyContent={'space-between'}>
          <Text size="sm">{t('Network fee')}</Text>
          <Text size="sm" variant="info">
            {t('Free')}
          </Text>
        </HStack>
      </Box>
    </VStack>
  );
};
