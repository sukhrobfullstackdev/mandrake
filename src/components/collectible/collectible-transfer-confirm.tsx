import OwnedNftTile from '@components/show-ui/owned-nft-tile';
import { ALCHEMY_KEYS } from '@constants/alchemy';
import { NFT_TRANSFER_ROUTES } from '@constants/nft';
import { useChainInfo } from '@hooks/common/chain-info';
import { useThemeColors } from '@hooks/common/client-config';
import { useSendRouter } from '@hooks/common/send-router';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useSingleNft, useTransactionReceipt } from '@hooks/data/embedded/alchemy';
import { OwnedNFT } from '@hooks/passport/use-nfts-for-owner';
import { useTranslation } from '@lib/common/i18n';
import { isEmpty } from '@lib/utils/is-empty';
import {
  Button,
  IcoCheckmarkCircleFill,
  IcoDismissCircleFill,
  IcoExternalLink,
  LoadingSpinner,
  Text,
} from '@magiclabs/ui-components';
import { Box, Center, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useEffect, useState } from 'react';

type Props = {
  contractAddress: string;
  tokenId: string;
  count: number;
  hash: string;
};

export const TRANSACTION_STATUS = {
  PROCESSING: 'PROCESSING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
} as const;

type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

export const CollectibleTransferConfirm = ({ contractAddress, tokenId, count, hash }: Props) => {
  const router = useSendRouter();
  const { t } = useTranslation('send');
  const { buttonColor } = useThemeColors();
  const walletAddress = useUserMetadata().userMetadata?.publicAddress;
  const { chainInfo } = useChainInfo();
  const networkName = chainInfo?.networkName as keyof typeof ALCHEMY_KEYS;

  const [status, setStatus] = useState<TransactionStatus>(TRANSACTION_STATUS.PROCESSING);

  const {
    data: nft,
    isError,
    isPending,
  } = useSingleNft(
    {
      networkName,
      contractAddress: contractAddress || '',
      tokenId: tokenId || '',
    },
    {
      enabled: Boolean(walletAddress) && !isEmpty(walletAddress),
    },
  );

  const handleBackToWallet = () => {
    router.replace('/send/rpc/wallet/magic_wallet/home');
  };

  const handleExternalLink = () => {
    window.open(chainInfo?.blockExplorer + '/tx/' + hash, '_blank', 'noopener noreferrer');
  };

  const { data: receipt } = useTransactionReceipt(
    {
      networkName,
      hash,
    },
    {
      refetchInterval: status === TRANSACTION_STATUS.PROCESSING ? 3000 : false,
    },
  );

  useEffect(() => {
    if (!receipt) {
      return;
    }

    if (receipt.status === 0) {
      setStatus(TRANSACTION_STATUS.FAILED);
    } else if (receipt.status === 1) {
      setStatus(TRANSACTION_STATUS.SUCCEEDED);
    }
  }, [receipt]);

  useEffect(() => {
    if (isError) {
      router.replace(NFT_TRANSFER_ROUTES.ERROR);
    }
  }, [isError]);

  if (isPending) {
    return (
      <Center w="full">
        <LoadingSpinner />
      </Center>
    );
  }

  return (
    <VStack w="full" gap={8}>
      <VStack gap={6}>
        <Box w={24} h={24}>
          <OwnedNftTile
            nft={{ ...(nft as unknown as OwnedNFT), balance: `${count}`, imageURL: nft?.image.originalUrl || '' }}
            balance={count}
            countPosition="bottom-right"
          />
        </Box>
        <Text
          size="lg"
          styles={{
            fontWeight: 'bold',
          }}
        >
          {nft?.name}
        </Text>
      </VStack>

      <VStack gap={4} alignItems="flex-start">
        <HStack gap={4} alignItems="center" w="full" ml={3}>
          <IcoCheckmarkCircleFill width={20} height={20} color={buttonColor ?? token('colors.magic.50')} />
          <HStack role="button" onClick={handleExternalLink} cursor="pointer">
            <Text
              styles={{
                fontWeight: 'bold',
                color: buttonColor ?? token('colors.magic.50'),
              }}
            >
              {t('Transfer initiated')}
            </Text>
            <IcoExternalLink width={12} height={12} color={buttonColor ?? token('colors.magic.50')} />
          </HStack>
        </HStack>
        {status === TRANSACTION_STATUS.PROCESSING && (
          <HStack gap={4} ml={3} alignItems="center">
            <LoadingSpinner size={20} strokeWidth={2.5} />
            <Text>{t('Sending collectible')}</Text>
          </HStack>
        )}
        {status === TRANSACTION_STATUS.SUCCEEDED && (
          <HStack gap={4} ml={3} alignItems="center">
            <IcoCheckmarkCircleFill width={20} height={20} color={buttonColor ?? token('colors.magic.50')} />
            <Text
              styles={{
                fontWeight: 'bold',
                color: buttonColor ?? token('colors.magic.50'),
              }}
            >
              {t('Transfer complete')}
            </Text>
          </HStack>
        )}
        {status === TRANSACTION_STATUS.FAILED && (
          <HStack gap={4} ml={3} alignItems="center">
            <IcoDismissCircleFill width={20} height={20} color={token('colors.negative.base')} />
            <Text
              styles={{
                fontWeight: 'bold',
                color: token('colors.negative.base'),
              }}
            >
              {t('Transfer failed')}
            </Text>
          </HStack>
        )}
        <Text size="sm" styles={{ textAlign: 'center', color: token('colors.text.tertiary') }}>
          {t('Transfers take about 30 seconds.')}
          <br />
          {t('You can close this window.')}
        </Text>
      </VStack>

      <Button
        variant="neutral"
        label={t('Back to Wallet')}
        expand
        aria-label="back to home"
        onPress={handleBackToWallet}
      />
    </VStack>
  );
};
