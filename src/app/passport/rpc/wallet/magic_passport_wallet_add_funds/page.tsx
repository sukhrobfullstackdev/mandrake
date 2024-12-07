'use client';

import { usePassportRouter } from '@hooks/common/passport-router';
import { useTranslation } from '@lib/common/i18n';
import {
  ButtonContainer,
  IcoBank,
  IcoCreditCard,
  LogoArbitrumMono,
  LogoBaseMono,
  LogoBnbMono,
  LogoEthereumMono,
  LogoOptimismMono,
  LogoPolygonMono,
  PassportPage,
  Text,
  WalletPage,
} from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';
import Image from 'next/image';
import { PropsWithChildren, useCallback } from 'react';

interface SelectionProps extends PropsWithChildren {
  direction?: 'row' | 'column';
  disabled?: boolean;
}

const Selection = ({ children, direction = 'column', disabled }: SelectionProps) => (
  <ButtonContainer
    className={css({
      backdropFilter: 'blur(8px)',
      bgColor: disabled ? 'text.primary/1' : 'text.primary/5',
      borderColor: 'text.primary/6',
      borderRadius: 12,
      borderStyle: 'solid',
      borderWidth: 'thin',
      textAlign: 'left',
      h: 'full',
      w: 'full',
    })}
    borderRadius={12}
    disabled={disabled}
  >
    <Stack direction={direction} gap={3} justify="space-between" px={4} py={5} w="full">
      {children}
    </Stack>
  </ButtonContainer>
);

export default function PassportShowUIPage() {
  const { t } = useTranslation('passport');
  const router = usePassportRouter();

  const onHome = useCallback(() => {
    return router.replace('/passport/rpc/wallet/magic_passport_wallet');
  }, []);

  return (
    <WalletPage.Content>
      <PassportPage onBack={onHome}>
        <PassportPage.Title branding="light" />
        <PassportPage.Content>
          <Image
            className={css({ pos: 'absolute', right: -8, top: 16, zIndex: -1 })}
            src="/images/eth-token-min.png"
            alt="eth token"
            height="148"
            width="148"
          />
          <Stack gap={4} w="full">
            <Box mb={3}>
              <Text.H3>{t('Add funds')}</Text.H3>
            </Box>
            <Selection>
              <Text.H4>{t('Transfer Crypto')}</Text.H4>
              <HStack gap={5} opacity={0.8}>
                <LogoEthereumMono />
                <LogoBaseMono />
                <LogoPolygonMono />
                <LogoBnbMono />
                <LogoArbitrumMono />
                <LogoOptimismMono />
              </HStack>
            </Selection>
            <Selection disabled direction="row">
              <Stack gap={1}>
                <Text.H4>{t('Buy now')}</Text.H4>
                <Text fontColor="text.tertiary">{t('Coming soon')}</Text>
              </Stack>
              <HStack>
                <IcoBank color={token('colors.text.tertiary')} />
                <IcoCreditCard color={token('colors.text.tertiary')} />
              </HStack>
            </Selection>
          </Stack>
        </PassportPage.Content>
      </PassportPage>
    </WalletPage.Content>
  );
}
