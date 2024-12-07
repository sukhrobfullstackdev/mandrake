'use client';

import { useTransferNft } from '@app/send/rpc/nft/magic_nft_transfer/__hooks__/use-transfer-nft';
import { YouNeedMoreTokenBottomSheet } from '@components/collectible/you-need-more-token-bottom-sheet';
import OwnedNftTile from '@components/show-ui/owned-nft-tile';
import { ALCHEMY_KEYS, ALCHEMY_NETWORKS } from '@constants/alchemy';
import { NFT_TRANSFER_ROUTES } from '@constants/nft';
import { useChainInfo } from '@hooks/common/chain-info';
import { useConfirmAction } from '@hooks/common/confirm-action';
import { useHydrateSession } from '@hooks/common/hydrate-session';
import { useSendRouter } from '@hooks/common/send-router';
import { useUserMetadata } from '@hooks/common/user-metadata';
import { useSingleNftForOwner } from '@hooks/data/embedded/alchemy';
import { ConfirmActionType } from '@hooks/data/embedded/confirm-action';
import { OwnedNFT } from '@hooks/passport/use-nfts-for-owner';
import { useTranslation } from '@lib/common/i18n';
import { isEmpty } from '@lib/utils/is-empty';
import { Button, IcoWarningFill, LoadingSpinner, Text, TextInput } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Center, HStack, Spacer, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useEffect, useMemo, useState } from 'react';
import { InsufficientFundsError, TransactionExecutionError } from 'viem';

type Props = {
  contractAddress: string;
  tokenId: string;
  recipient: string | null;
  count: string | null;
};

export function CollectibleTransferForm({ contractAddress, tokenId, recipient, count }: Props) {
  const router = useSendRouter();
  const { t } = useTranslation('send');
  const { isComplete: isHydrateSessionComplete } = useHydrateSession();
  const walletAddress = useUserMetadata(isHydrateSessionComplete).userMetadata?.publicAddress ?? '';
  const { chainInfo } = useChainInfo();
  const chainId = chainInfo?.chainId as number;
  const networkName = chainInfo?.networkName as keyof typeof ALCHEMY_KEYS;
  const BlockChainIcon = chainInfo?.blockchainIcon as React.FC;
  const [opened, setOpened] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { doConfirmActionIfRequired, isActionConfirmed, isActionConfirmationExpired, isSkipConfirmAction } =
    useConfirmAction();

  const { transferNft } = useTransferNft();
  const isSupported = useMemo(() => {
    return Object.keys(ALCHEMY_NETWORKS).includes(networkName);
  }, [networkName]);

  const [validity, setValidity] = useState({
    quantity: {
      isFocused: false,
      isValid: true,
      errorMessage: '',
    },
    sendTo: {
      isFocused: false,
      isValid: recipient?.length === 42 && recipient?.startsWith('0x') ? true : false,
      errorMessage: '',
    },
  });

  const [formData, setFormData] = useState({
    quantity: count || '1',
    sendTo: recipient || '',
  });

  const isValid = useMemo(() => {
    return Object.values(validity).every(v => v.isValid);
  }, [validity]);

  const {
    data: nft,
    isError,
    isPending,
  } = useSingleNftForOwner(
    {
      networkName,
      address: walletAddress || '',
      contractAddress: contractAddress || '',
      tokenId: tokenId || '',
    },
    {
      enabled: Boolean(walletAddress) && !isEmpty(walletAddress),
    },
  );

  const handleMax = () => {
    if (nft) {
      setFormData(prev => ({ ...prev, quantity: nft.balance }));
    }
  };

  const confirmAction = async () => {
    try {
      setIsValidating(true);
      await doConfirmActionIfRequired({
        action: ConfirmActionType.TransferTransaction,
        payload: {
          chainId: chainId.toString(),
          to: formData.sendTo,
          nft: {
            contract_address: contractAddress,
            quantity: Number(formData.quantity),
            token_id: tokenId,
            token_type: nft?.tokenType ?? 'ERC721',
          },
        },
      });
    } catch (error) {
      setIsValidating(false);
      if (error instanceof TransactionExecutionError) {
        if (error.cause instanceof InsufficientFundsError) {
          setOpened(true);
        }
      }
    }
  };
  useEffect(() => {
    if (!isSupported && !isPending) router.replace(NFT_TRANSFER_ROUTES.NOT_SUPPORTED);
  }, [isSupported, isPending]);

  useEffect(() => {
    if (isActionConfirmed && !isActionConfirmationExpired && !isSkipConfirmAction) {
      (async () => {
        const hash = await transferNft({
          chainId: chainInfo?.chainId as number,
          to: formData.sendTo,
          contractAddress,
          quantity: Number(formData.quantity),
          tokenId,
          tokenType: nft?.tokenType ?? 'ERC721',
        });
        router.replace(
          `${NFT_TRANSFER_ROUTES.CONFIRM}?${new URLSearchParams({
            contractAddress,
            tokenId,
            count: formData.quantity.toString(),
            hash,
          }).toString()}`,
        );
      })();
    }
    if (!isActionConfirmed && isActionConfirmationExpired && !isSkipConfirmAction) {
      setIsValidating(false);
    }
  }, [isActionConfirmed, isActionConfirmationExpired, isSkipConfirmAction]);
  useEffect(() => {
    if (!nft && !isPending && isSupported) {
      router.replace(NFT_TRANSFER_ROUTES.ERROR);
    }

    if (validity.quantity.isFocused) {
      if (Number(formData.quantity) > Number(nft?.balance)) {
        setValidity(prev => ({
          ...prev,
          quantity: {
            ...prev.quantity,
            isValid: false,
            errorMessage: t('Quantity exceeds available balance'),
          },
        }));
      } else {
        setValidity(prev => ({ ...prev, quantity: { ...prev.quantity, isValid: true, errorMessage: '' } }));
      }
    }

    if (validity.sendTo.isFocused) {
      if (isEmpty(formData.sendTo) || formData.sendTo.length !== 42 || !formData.sendTo.startsWith('0x')) {
        setValidity(prev => ({
          ...prev,
          sendTo: {
            ...prev.sendTo,
            isValid: false,
            errorMessage: t(
              'Invalid wallet address. Please enter a valid 42-character {{networkName}} wallet address (0x...).',
              {
                networkName: chainInfo?.networkName,
              },
            ),
          },
        }));
      } else {
        setValidity(prev => ({ ...prev, sendTo: { ...prev.sendTo, isValid: true, errorMessage: '' } }));
      }
    }
  }, [formData]);

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
    <>
      <VStack w="full" gap={0}>
        <HStack justifyContent="space-between" w="full">
          <VStack alignItems="flex-start" justifyContent="space-around" gap={2}>
            <Text size="sm" styles={{ fontWeight: 500 }}>
              Collectible
            </Text>
            <Text>{nft?.name ?? '(unknown)'}</Text>
          </VStack>
          <Box h="4.5rem" w="4.5rem">
            <OwnedNftTile
              nft={{ ...(nft as unknown as OwnedNFT), imageURL: nft?.image.originalUrl || '' }}
              isCountVisible={false}
            />
          </Box>
        </HStack>

        <Spacer mt={6} />

        <VStack w="100%" gap={6}>
          <TextInput
            className={css({
              width: '100%',
            })}
            type="number"
            disabled={!isSupported}
            value={formData.quantity}
            errorMessage={validity.quantity.errorMessage}
            onFocus={() => setValidity(prev => ({ ...prev, quantity: { ...prev.quantity, isFocused: true } }))}
            onBlur={() => setValidity(prev => ({ ...prev, quantity: { ...prev.quantity, isFocused: false } }))}
            onChange={(v: string) => setFormData(prev => ({ ...prev, quantity: v }))}
            label={
              <HStack justifyContent="space-between">
                <Text size="sm" styles={{ fontWeight: 500 }}>
                  {t('Quantity')}
                </Text>
                <Text
                  size="sm"
                  styles={{
                    color: token('colors.text.secondary'),
                  }}
                >
                  {t('{{count}} available', {
                    count: nft?.balance,
                  })}
                </Text>
              </HStack>
            }
          >
            <TextInput.ActionButton label="Max" onPress={handleMax} />
          </TextInput>

          <TextInput
            className={css({
              width: '100%',
            })}
            type="text"
            disabled={!isSupported}
            value={formData.sendTo}
            errorMessage={validity.sendTo.errorMessage}
            placeholder={`${t('Wallet address')} (${chainInfo?.networkName})`}
            onFocus={() => setValidity(prev => ({ ...prev, sendTo: { ...prev.sendTo, isFocused: true } }))}
            onBlur={() => setValidity(prev => ({ ...prev, sendTo: { ...prev.sendTo, isFocused: false } }))}
            onChange={(v: string) => setFormData(prev => ({ ...prev, sendTo: v }))}
            label={
              <Text size="sm" styles={{ fontWeight: 500 }}>
                {t('Send to')}
              </Text>
            }
          >
            <TextInput.Suffix>
              {isEmpty(validity.sendTo.errorMessage) ? (
                <BlockChainIcon />
              ) : (
                <IcoWarningFill color={token('colors.negative.base')} />
              )}
            </TextInput.Suffix>
          </TextInput>

          <Button
            label={t('Preview transfer')}
            expand
            validating={isValidating}
            disabled={isPending || isValidating || !isValid || !isSupported}
            onPress={() => confirmAction()}
          />
          <Text
            fontColor="text.secondary"
            size="sm"
            styles={{ fontSize: '0.875rem', lineHeight: '1.5rem', color: '#77767a' }}
          >
            {t('For security purposes, a new tab from Magic will open for you to confirm this transaction.')}
          </Text>
        </VStack>
      </VStack>
      <YouNeedMoreTokenBottomSheet isOpened={opened} setIsOpened={setOpened} />
    </>
  );
}
