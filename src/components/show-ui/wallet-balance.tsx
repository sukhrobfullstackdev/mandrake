import { useBalanceInUsd } from '@hooks/common/show-ui';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { copyToClipboard } from '@lib/utils/copy';
import { Text, WalletAddress } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';

const WalletBalance = () => {
  const walletAddress = useUserMetadata().userMetadata?.publicAddress;
  const walletBalance = useBalanceInUsd(walletAddress ?? '');

  const handleCopy = () => {
    if (!walletAddress) return;
    copyToClipboard(walletAddress);
  };

  return (
    <VStack gap={1}>
      <Text.H2>{walletBalance}</Text.H2>
      <WalletAddress address={walletAddress || ''} onCopy={handleCopy} aria-label="copy wallet address" />
    </VStack>
  );
};

export default WalletBalance;
