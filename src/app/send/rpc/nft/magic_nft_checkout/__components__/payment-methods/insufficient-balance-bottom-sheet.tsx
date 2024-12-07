import { BottomSheet, BottomSheetProps } from '@app/send/rpc/nft/magic_nft_checkout/__components__/bottom-sheet';
import { useNftCheckoutContext } from '@app/send/rpc/nft/magic_nft_checkout/nft-checkout-context';
import { NFT_CHECKOUT_STATUS } from '@constants/nft';
import { useBalance } from '@hooks/data/embedded/block';
import { useNftCheckoutPayload, useNftTokenInfo } from '@hooks/data/embedded/nft';
import { useTranslation } from '@lib/common/i18n';
import { toEtherFixed } from '@lib/utils/nft-checkout';
import { Button, IcoCreditCard, IcoQrcode, IcoQuestionCircleFill, Text, Tooltip } from '@magiclabs/ui-components';
import { HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { formatEther } from 'viem';

export const InsufficientBalanceBottomSheet = ({ isOpened, setIsOpened }: BottomSheetProps) => {
  const { t } = useTranslation('send');
  const { setStatus } = useNftCheckoutContext();
  const { nftCheckoutPayload } = useNftCheckoutPayload();
  const { data: nftTokenInfo } = useNftTokenInfo({
    contractId: nftCheckoutPayload.contractId,
    tokenId: nftCheckoutPayload.tokenId,
  });

  const { balance } = useBalance({
    chainId: nftTokenInfo.contractChainId,
    address: nftCheckoutPayload.walletAddress ?? '',
  });

  const handlePayWithCard = () => {
    setIsOpened(false);
    setStatus(NFT_CHECKOUT_STATUS.CARD_PAYMENT);
  };

  const handleReceive = () => {
    setIsOpened(false);
    setStatus(NFT_CHECKOUT_STATUS.RECEIVE_FUNDS);
  };

  return (
    <BottomSheet isOpened={isOpened} setIsOpened={setIsOpened}>
      <VStack gap={5} alignItems="flex-start">
        <Text
          size="lg"
          styles={{
            fontWeight: 700,
          }}
        >
          {t('Insufficient funds')}
        </Text>

        <VStack gap={2} alignItems="flex-start">
          <HStack gap={1.5}>
            <Text
              size="lg"
              styles={{
                fontWeight: 600,
              }}
            >
              {t('You need {{price}} ETH + gas fees', { price: nftTokenInfo.price })}
            </Text>
            <Tooltip content={t('Gas costs can rise suddenly, so be sure to top up with a bit extra')}>
              <IcoQuestionCircleFill width={16} height={16} color={token('colors.ink.50')} />
            </Tooltip>
          </HStack>
          <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
            {t('Current balance: {{balance}} ETH', { balance: toEtherFixed(formatEther(balance)) })}
          </Text>
        </VStack>

        <VStack gap={3} alignItems="flex-start" w="full">
          <Button size="md" variant="tertiary" label={t('Receive')} expand onPress={handleReceive}>
            <Button.LeadingIcon color={token('colors.text.primary')}>
              <IcoQrcode />
            </Button.LeadingIcon>
          </Button>

          <Button expand size="md" variant="primary" label={t('Pay with Card')} onPress={handlePayWithCard}>
            <Button.LeadingIcon>
              <IcoCreditCard />
            </Button.LeadingIcon>
          </Button>
        </VStack>
      </VStack>
    </BottomSheet>
  );
};
