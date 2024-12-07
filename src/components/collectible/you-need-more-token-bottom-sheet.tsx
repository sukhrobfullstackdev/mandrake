import { BottomSheet, BottomSheetProps } from '@app/send/rpc/nft/magic_nft_checkout/__components__/bottom-sheet';
import { useChainInfo } from '@hooks/common/chain-info';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useFallbackNetworkFee } from '@hooks/data/embedded/nft';
import { useTranslation } from '@lib/common/i18n';
import { copyToClipboard } from '@lib/utils/copy';
import { toEtherFixed } from '@lib/utils/nft-checkout';
import { Button, IcoCheckmark, IcoCopy, IcoExternalLink, Text } from '@magiclabs/ui-components';
import { Center, Spacer } from '@styled/jsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatEther } from 'viem';

export const YouNeedMoreTokenBottomSheet = ({ isOpened, setIsOpened }: BottomSheetProps) => {
  const { t } = useTranslation('send');
  const walletAddress = useUserMetadata().userMetadata?.publicAddress;
  const { chainInfo } = useChainInfo();
  const BlockChainIcon = chainInfo?.blockchainIcon as React.FC<{ width: number; height: number }>;
  const [isCopied, setIsCopied] = useState(false);

  const { data: networkFee } = useFallbackNetworkFee();

  const handleFaucet = () => {
    window.open(chainInfo?.faucetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyToClipboard = useCallback(() => {
    if (walletAddress) {
      copyToClipboard(walletAddress);
      setIsCopied(true);
    }
  }, [walletAddress]);

  const formattedNetworkFee = useMemo(() => {
    return toEtherFixed(formatEther(networkFee ?? BigInt(0)));
  }, [networkFee]);

  useEffect(() => {
    if (isCopied) {
      const timeoutId = setTimeout(() => {
        setIsCopied(false);
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
    return () => {};
  }, [isCopied]);

  return (
    <BottomSheet isOpened={isOpened} setIsOpened={setIsOpened}>
      <Center flexDirection="column" gap={0}>
        {BlockChainIcon && <BlockChainIcon width={48} height={48} />}
        <Spacer mt={4} />
        <Text size="lg" styles={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center' }}>
          {t('You need more {{currency}}', {
            currency: chainInfo?.currency,
          })}
        </Text>
        <Spacer mt={3} />
        {chainInfo?.isMainnet ? (
          <>
            <Text styles={{ textAlign: 'center' }}>
              {t("You'll need at least {{networkFee}} {{currency}} to cover the required network fee", {
                networkFee: formattedNetworkFee,
                currency: chainInfo?.currency,
              })}
            </Text>
            {/* TODO: route to onramp page */}
            {/* <Spacer mt={8} /> */}
            {/* <Button
              expand
              label={t('Buy {{currency}}', {
                currency: chainInfo?.currency,
              })}
            /> */}
          </>
        ) : (
          <>
            <Text styles={{ textAlign: 'center' }}>
              {t('Visit a {{currency}} faucet to top up with at least {{networkFee}} {{currency}}.', {
                currency: chainInfo?.currency,
                networkFee: formattedNetworkFee,
              })}
            </Text>
            <Spacer mt={8} />
            <Button
              expand
              label={isCopied ? t('Copied!') : t('Copy address')}
              variant="neutral"
              onPress={handleCopyToClipboard}
            >
              <Button.LeadingIcon>{isCopied ? <IcoCheckmark /> : <IcoCopy />}</Button.LeadingIcon>
            </Button>
            <Spacer mt={4} />
            {chainInfo?.faucetUrl && (
              <Button expand label={`${chainInfo?.currency} Faucet`} onPress={handleFaucet}>
                <Button.TrailingIcon>
                  <IcoExternalLink />
                </Button.TrailingIcon>
              </Button>
            )}
          </>
        )}
      </Center>
    </BottomSheet>
  );
};
