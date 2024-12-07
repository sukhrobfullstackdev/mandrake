import { WALLET_PROVIDERS } from '@constants/nft';
import { useNftCheckoutPayload } from '@hooks/data/embedded/nft';
import { useStore } from '@hooks/store';
import { copyToClipboard } from '@lib/utils/copy';
import { truncateEmail } from '@lib/utils/nft-checkout';
import { IconMagicLogo, IcoWallet, Text, WalletAddress } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';

export const CopyAddress = () => {
  const email = useStore(state => state.email);
  const { nftCheckoutPayload } = useNftCheckoutPayload();

  return nftCheckoutPayload?.walletProvider === WALLET_PROVIDERS.WEB3MODAL ? (
    <HStack gap={2}>
      <WalletAddress
        address={nftCheckoutPayload.walletAddress ?? ''}
        onCopy={(value: string) => copyToClipboard(value)}
      />
      <IcoWallet color={token('colors.text.secondary')} width={20} height={20} />
    </HStack>
  ) : (
    <HStack gap={2}>
      <Text size="sm" styles={{ fontWeight: 400 }}>
        {truncateEmail(email ?? '', 28)}
      </Text>
      <IconMagicLogo width={24} height={24} />
    </HStack>
  );
};
