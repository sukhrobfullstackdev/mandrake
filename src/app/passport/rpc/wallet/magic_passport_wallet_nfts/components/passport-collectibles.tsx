import OwnedNftTile from '@components/show-ui/owned-nft-tile';
import { usePassportRouter } from '@hooks/common/passport-router';
import { Grid } from '@styled/jsx';
import { OwnedNFT } from '@hooks/passport/use-nfts-for-owner';
import { useNftContext } from '@app/passport/rpc/passport-context';

type PassportCollectiblesProps = {
  nfts: OwnedNFT[];
};

export default function PassportCollectibles({ nfts }: PassportCollectiblesProps) {
  const router = usePassportRouter();
  const nftContext = useNftContext();
  const handleShowDetails = (selectedNft: OwnedNFT) => {
    nftContext.setNftState({ selectedNft });

    router.replace(`/passport/rpc/wallet/magic_passport_wallet_nfts/collectible_details`);
  };

  return (
    <Grid
      gap={5}
      gridTemplateColumns={2}
      mt={6}
      pb={32}
      mx={10}
      maxH="calc(100vh - 58px)"
      maxW="23rem"
      overflow="scroll"
      scrollbarWidth="none"
    >
      {nfts
        .filter(v => !v.contract?.isSpam)
        .map(v => (
          <OwnedNftTile
            key={v.contract.address + v.contract.tokenType + v.tokenId}
            nft={v}
            balance={Number(v.balance)}
            onPress={() => handleShowDetails(v)}
            isPassport
          />
        ))}
    </Grid>
  );
}
