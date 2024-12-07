import { useUserMetadata } from '@hooks/common/user-metadata';
import { Text } from '@magiclabs/ui-components';

const MonoWalletAddress = () => {
  const { userMetadata } = useUserMetadata();
  const publicAddress = userMetadata?.publicAddress || '';

  const walletAddress =
    publicAddress.length > 42 ? `${publicAddress.slice(0, 15)}...${publicAddress.slice(-15)}` : publicAddress;

  return (
    <Text.Mono size="sm" styles={{ fontWeight: 500 }}>
      {walletAddress}
    </Text.Mono>
  );
};

export default MonoWalletAddress;
