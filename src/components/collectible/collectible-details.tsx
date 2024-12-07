import { CollectibleAttirbute } from '@components/collectible/collectible-attribute';
import OwnedNftTile from '@components/show-ui/owned-nft-tile';
import { ALCHEMY_KEYS, ALCHEMY_NETWORKS } from '@constants/alchemy';
import { NFT_TRANSFER_ROUTES } from '@constants/nft';
import { useChainInfo } from '@hooks/common/chain-info';
import { useClientConfigFeatureFlags } from '@hooks/common/client-config';
import { useSendRouter } from '@hooks/common/send-router';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useDedicatedViewOnOpenSea } from '@hooks/common/view-on-opensea';
import { useSingleNftForOwner } from '@hooks/data/embedded/alchemy';
import { useTranslation } from '@lib/common/i18n';
import { isEmpty } from '@lib/utils/is-empty';
import { Button, IcoCaretDown, IcoExternalLink, LoadingSpinner, NFTTile, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Center, Grid, HStack, Spacer, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useCallback, useMemo, useState } from 'react';

type Props = {
  contractAddress: string;
  tokenId: string;
};

export const CollectibleDetails = ({ contractAddress, tokenId }: Props) => {
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const walletAddress = useUserMetadata().userMetadata?.publicAddress;
  const { chainInfo } = useChainInfo();
  const networkName = chainInfo?.networkName as keyof typeof ALCHEMY_KEYS;
  const BlockChainIcon = chainInfo?.blockchainIcon as React.FC;
  const [opened, setOpened] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const features = useClientConfigFeatureFlags();
  const { viewOnOpenSea } = useDedicatedViewOnOpenSea();

  const isSendEnabled = useMemo(() => {
    return features?.isNftTransferEnabled && Object.keys(ALCHEMY_NETWORKS).includes(networkName);
  }, [features, networkName]);

  const handleOpenSea = useCallback(() => {
    viewOnOpenSea({
      contractAddress,
      tokenId,
    });
  }, [contractAddress, tokenId, viewOnOpenSea]);

  const handleSend = () => {
    setIsSending(true);
    router.replace(
      `${NFT_TRANSFER_ROUTES.COMPOSE}?${new URLSearchParams({
        contractAddress,
        tokenId,
      })}`,
    );
  };

  const {
    data: nft,
    isError,
    isPending,
  } = useSingleNftForOwner(
    {
      networkName,
      address: walletAddress || '',
      contractAddress,
      tokenId,
    },
    {
      enabled: !!walletAddress && !isEmpty(walletAddress),
    },
  );

  // TODO: implment error UI
  if (isError) {
    return <div>Failed to get nft</div>;
  }

  // TODO: implment loading UI
  if (isPending) {
    return (
      <Center w="full">
        <LoadingSpinner />
      </Center>
    );
  }

  return (
    <VStack gap={10}>
      <OwnedNftTile
        nft={{ ...nft, imageURL: nft.image.originalUrl || '' }}
        balance={Number(nft.balance)}
        isCountVisible={false}
      />

      <VStack alignItems="flex-start" gap={6}>
        <VStack gap={0} alignItems="flex-start">
          <HStack alignItems="center">
            {nft.contract?.openSeaMetadata?.imageUrl && (
              <Box w={6} h={6}>
                <NFTTile src={nft.contract.openSeaMetadata.imageUrl} alt="Collection" />
              </Box>
            )}

            {nft.contract?.openSeaMetadata?.collectionName && (
              <Text
                styles={{
                  color: token('colors.text.primary'),
                }}
              >
                {nft.contract.openSeaMetadata.collectionName}
              </Text>
            )}
          </HStack>

          <Spacer mt={3} />
          <Text.H4>{nft?.name ?? '(Unknown)'}</Text.H4>

          {nft?.description && (
            <>
              <Spacer mt={6} />
              <Text>{nft?.description}</Text>
            </>
          )}
        </VStack>

        <Grid w="full" gap={4} gridTemplateColumns={isSendEnabled ? 2 : 1}>
          <Button label="OpenSea" variant="neutral" iconSize={12} expand onPress={handleOpenSea}>
            <Button.TrailingIcon>
              <IcoExternalLink />
            </Button.TrailingIcon>
          </Button>
          {isSendEnabled && (
            <Button label="Send" disabled={isSending} validating={isSending} expand onPress={handleSend} />
          )}
        </Grid>
      </VStack>

      <VStack w="full" gap={0}>
        {Number(nft.balance) > 1 && (
          <CollectibleAttirbute name={t('Quantity')}>
            <Text>{nft.balance}</Text>
          </CollectibleAttirbute>
        )}
        <CollectibleAttirbute name={t('Blockchain')}>
          <HStack>
            {BlockChainIcon && <BlockChainIcon />}
            <Text size="sm">{networkName}</Text>
          </HStack>
        </CollectibleAttirbute>

        {nft.raw.metadata?.attributes && nft.raw.metadata?.attributes?.length > 0 && (
          <>
            <CollectibleAttirbute
              name={t('Properties')}
              role="button"
              onClick={() => setOpened(prev => !prev)}
              cursor="pointer"
            >
              <HStack>
                <Text size="sm">{nft.raw.metadata?.attributes?.length}</Text>
                <IcoCaretDown
                  width={16}
                  height={16}
                  className={css({
                    transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease-in-out',
                  })}
                />
              </HStack>
            </CollectibleAttirbute>
            {opened && (
              <VStack w="full">
                {nft.raw.metadata?.attributes?.map((v: { trait_type: string; value: string }) => (
                  <HStack key={v.trait_type} w="full" justifyContent="space-between">
                    <Text size="sm">{v.trait_type}</Text>
                    <Text size="sm">{v.value}</Text>
                  </HStack>
                ))}
              </VStack>
            )}
          </>
        )}
      </VStack>
    </VStack>
  );
};
