import { usePassportViewOnOpenSea } from '@hooks/common/view-on-opensea';
import { Button, IcoLockLocked, Text, Tooltip } from '@magiclabs/ui-components';
import { Box, Center, HStack, Stack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';
import { useCallback } from 'react';

type NFTDetailsProps = {
  nftName: string;
  description: string;
  collectionName?: string;
  collectionLogoSrc?: string;
  contractAddress?: string;
  networkName?: string;
  tokenId?: string;
};

const isTransferEnabled = true;

export default function NFTDetails({
  nftName,
  description,
  collectionName,
  collectionLogoSrc,
  contractAddress,
  networkName,
  tokenId,
}: NFTDetailsProps) {
  const { t } = useTranslation('passport');
  const { viewOnOpenSea, error } = usePassportViewOnOpenSea();

  const handleOpenSea = useCallback(() => {
    if (contractAddress && tokenId && networkName) {
      viewOnOpenSea({ contractAddress, tokenId, networkName });
    }
  }, [contractAddress, tokenId, networkName, viewOnOpenSea]);

  return (
    <>
      <Stack gap={3}>
        {collectionName && (
          <HStack gap={2}>
            {collectionLogoSrc && (
              <Image src={collectionLogoSrc} alt={`${collectionName} logo`} height={24} width={24} />
            )}
            <Text variant="info" fontWeight="semibold">
              {collectionName}
            </Text>
          </HStack>
        )}
        <Stack gap={2}>
          <Text.H2>{nftName}</Text.H2>
          <Text fontColor="text.secondary">{description}</Text>
        </Stack>
      </Stack>

      <Stack gap={6} mt={8} mb={isTransferEnabled ? 8 : 0}>
        <VStack gap={3}>
          <HStack gap={4} w="full">
            {/* The boxes wrapping the buttons and tooltip can be removed once the tooltip is removed for testnet */}
            <Box flex={1}>
              <Button size="lg" variant="neutral" label={t('OpenSea')} expand onPress={handleOpenSea} />
            </Box>
            <Box flex={1}>
              <Tooltip content="Coming soon" expand width="max-content">
                <Box>
                  {isTransferEnabled && <Button size="lg" variant="inverse" label={t('Send')} expand disabled />}
                </Box>
              </Tooltip>
            </Box>
          </HStack>
          {error && (
            <Text variant="error" size="sm" styles={{ textAlign: 'center' }}>
              {error.message}
            </Text>
          )}
        </VStack>

        {!isTransferEnabled && (
          <Center gap={2} mb={6}>
            <IcoLockLocked height={16} width={16} color={token('colors.text.tertiary')} />
            <Text size="sm" fontColor="text.secondary">
              {t('Transfers disabled by creator')}
            </Text>
          </Center>
        )}
      </Stack>
    </>
  );
}
