'use client';

import Collectibles from '@components/show-ui/collectibles';
import { ALCHEMY_KEYS } from '@constants/alchemy';
import { useChainInfo } from '@hooks/common/chain-info';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useNftsForOwner } from '@hooks/data/embedded/alchemy';
import { LoadingSpinner, Text } from '@magiclabs/ui-components';
import { Center } from '@styled/jsx';

const ErrorFallback = ({ message }: { message: string }) => {
  return <Text variant="error">{message}</Text>;
};

const PendingFallback = () => {
  return (
    <Center w="full">
      <LoadingSpinner />
    </Center>
  );
};

export default function NFTList() {
  const walletAddress = useUserMetadata().userMetadata?.publicAddress;
  const { chainInfo } = useChainInfo();
  const networkName = chainInfo?.networkName as keyof typeof ALCHEMY_KEYS;

  const { data, isError, isPending, error } = useNftsForOwner(
    {
      networkName,
      address: walletAddress || '',
    },
    {
      enabled: !!walletAddress && !!networkName,
      retry: false,
    },
  );

  return (
    <>
      {isError && <ErrorFallback message={error.message} />}
      {isPending && <PendingFallback />}
      {data && <Collectibles nfts={data.ownedNfts} />}
    </>
  );
}
