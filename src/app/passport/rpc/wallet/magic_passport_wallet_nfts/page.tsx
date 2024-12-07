'use client';

import WalletHeader from '@app/passport/rpc/wallet/components/wallet-header';
import WalletNavigation from '@app/passport/rpc/wallet/components/wallet-navigation';
import NoCollectibles from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/components/no-collectibles';
import PassportCollectibles from '@app/passport/rpc/wallet/magic_passport_wallet_nfts/components/passport-collectibles';
import { useNftsForOwner } from '@hooks/passport/use-nfts-for-owner';
import { AnimatedSpinner, Callout, WalletNavigationType, WalletPage } from '@magiclabs/ui-components';
import { Box, Center } from '@styled/jsx';

export default function PassportCollectiblesListPage() {
  const { data, isError, isPending, error } = useNftsForOwner();

  return (
    <>
      <WalletHeader />
      <WalletNavigation active={WalletNavigationType.Gallery} />
      <WalletPage.Content>
        {isPending ? (
          <Center h="50vh">
            <AnimatedSpinner />
          </Center>
        ) : isError ? (
          <Box mt="20vh" px={10}>
            <Callout variant="error" size="md" label={error.message} />
          </Box>
        ) : data.length ? (
          <PassportCollectibles nfts={data} />
        ) : (
          <NoCollectibles />
        )}
      </WalletPage.Content>
    </>
  );
}
