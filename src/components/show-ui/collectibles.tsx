'use client';

import NFTPlaceholder from '@components/show-ui/nft-placeholder';
import OwnedNftTile from '@components/show-ui/owned-nft-tile';
import { useSendRouter } from '@hooks/common/send-router';
import { useTranslation } from '@lib/common/i18n';
import { IcoCaretDown, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Grid, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { OwnedNft } from 'alchemy-sdk';
import { useMemo, useState } from 'react';

type Props = {
  nfts: OwnedNft[];
};

const Collectibles = ({ nfts }: Props) => {
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const [opened, setOpened] = useState(false);

  const spams = useMemo(() => {
    return nfts.filter(v => v.contract?.isSpam);
  }, [nfts]);

  const handleClickHidden = () => {
    setOpened(prev => !prev);
  };

  const handleShowDetails = (contractAddress: string, tokenId: string) => {
    router.replace(
      `/send/rpc/wallet/magic_wallet/collectible_details?${new URLSearchParams({
        contractAddress,
        tokenId,
      })}`,
    );
  };

  if (nfts.length === 0) {
    return <NFTPlaceholder />;
  }

  return (
    <>
      <Grid role="grid" gap={4} gridTemplateColumns={2} w="full">
        {nfts
          .filter(v => !v.contract?.isSpam)
          .map(v => (
            <OwnedNftTile
              key={v.contract.address + v.contract.tokenType + v.tokenId}
              nft={{ ...v, imageURL: v.image.originalUrl || '' }}
              balance={Number(v.balance)}
              onPress={() => handleShowDetails(v.contract.address, v.tokenId)}
            />
          ))}
      </Grid>

      {spams.length > 0 && (
        <VStack w="full">
          <HStack
            role="button"
            justifyContent="space-between"
            alignItems="center"
            cursor="pointer"
            w="full"
            onClick={handleClickHidden}
          >
            <Text styles={{ color: token('colors.text.secondary') }}>
              {t('Hidden {{count}}', {
                count: `(${spams.length})`,
              })}
            </Text>
            <IcoCaretDown
              width={20}
              height={20}
              color={token('colors.neutral.primary')}
              className={css({
                transition: 'transform 0.2s ease-in-out',
                transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
              })}
            />
          </HStack>

          {opened && (
            <VStack>
              <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
                {t('These collectibles come from unverified sources. Proceed with caution.')}
              </Text>

              <Grid gap={4} gridTemplateColumns={2} w="full">
                {spams.map(v => (
                  <OwnedNftTile
                    nft={{ ...v, imageURL: v.image.originalUrl || '' }}
                    balance={Number(v.balance)}
                    key={v.contract.address + v.contract.tokenType + v.tokenId}
                    onPress={() => handleShowDetails(v.contract.address, v.tokenId)}
                  />
                ))}
              </Grid>
            </VStack>
          )}
        </VStack>
      )}
    </>
  );
};

export default Collectibles;
