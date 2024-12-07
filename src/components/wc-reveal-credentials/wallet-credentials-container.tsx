'use client';

import WalletCredentialsList from '@components/wc-reveal-credentials/wallet-credentials-list';
import { LoadingSpinner } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';

interface WalletCredentialsContainerProps {
  isHidden: boolean;
  isLoading: boolean;
  rawWalletCredentials: string;
}

const WalletCredentialsContainer = ({ isHidden, isLoading, rawWalletCredentials }: WalletCredentialsContainerProps) => {
  if (isLoading) {
    return (
      <Box mb={2}>
        <LoadingSpinner size={48} />
      </Box>
    );
  }

  return (
    <Box w="full" wordBreak="break-all" p="1.5rem" rounded="1.25rem" bg="#FFFFFF08">
      <Box filter={isHidden ? 'blur(8px)' : ''}>
        <WalletCredentialsList rawWalletCredentials={rawWalletCredentials} />
      </Box>
    </Box>
  );
};

export default WalletCredentialsContainer;
