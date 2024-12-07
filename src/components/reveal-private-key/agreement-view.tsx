'use client';

import { RevealViewType, RevealViewTypeObj } from '@components/reveal-private-key/__type__';
import AgreementItem from '@components/reveal-private-key/agreement-item';
import { ROUTE } from '@components/reveal-private-key/constants/agreement-view';
import RevealKeyHeader from '@components/reveal-private-key/reveal-key-header';
import MonoWalletAddress from '@components/reveal-private-key/wallet-address';
import { magicTermsOfServiceUrl } from '@constants/privacy-and-tos-urls';
import { useSendRouter } from '@hooks/common/send-router';
import { T, useTranslation } from '@lib/common/i18n';
import { Button, IcoKey, Page, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, VStack } from '@styled/jsx';
import Link from 'next/link';
import { useState } from 'react';

type AgreementViewPageProps = {
  type?: RevealViewType;
};

export default function AgreementViewPage({ type = RevealViewType.REVEAL }: AgreementViewPageProps) {
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const [isBoxOneChecked, setIsBoxOneChecked] = useState(false);
  const [isBoxTwoChecked, setIsBoxTwoChecked] = useState(false);
  const [isBoxThreeChecked, setIsBoxThreeChecked] = useState(false);
  const [isRevealKeyPressed, setIsRevealKeyPressed] = useState(false);

  const handlePressRevealKey = () => {
    setIsRevealKeyPressed(true);
    router.replace(ROUTE[type]);
  };

  const BUTTON: RevealViewTypeObj = {
    [RevealViewType.EXPORT]: t('Export private key'),
    [RevealViewType.REVEAL]: t('Reveal private key'),
  };

  return (
    <>
      <RevealKeyHeader />
      <Page.Icon>
        <IcoKey />
      </Page.Icon>
      <Page.Content>
        <Text.H4 styles={{ fontWeight: 600 }}>{t('Before you continue')}</Text.H4>
        <VStack gap={0}>
          <Text size="sm" styles={{ fontWeight: 500 }}>
            {t('By revealing the private key for')}
          </Text>
          <MonoWalletAddress />
          <Text size="sm" styles={{ fontWeight: 500 }}>
            {t('you agree to the following')}:
          </Text>
        </VStack>
        <VStack gap={3.5} mt={3} mb={6}>
          <AgreementItem isChecked={isBoxOneChecked} setIsChecked={setIsBoxOneChecked}>
            <T
              ns="send"
              translate="You have read and agreed to <termsOfService/>, including the risks related to owning your private key disclosed in the Terms of Service."
            >
              <Link
                href={magicTermsOfServiceUrl}
                id="termsOfService"
                target="_blank"
                rel="noopener noreferrer"
                className={css({ color: 'brand.base', fontSize: 'sm', fontWeight: 'medium' })}
              >
                Magic&apos;s Terms of Service
              </Link>
            </T>
          </AgreementItem>
          <AgreementItem isChecked={isBoxTwoChecked} setIsChecked={setIsBoxTwoChecked}>
            {t(
              'You shall be responsible for the management and security of this key and any assets associated with this key, and that Magic cannot help you recover, access or store your raw private key on your\u00A0behalf.',
            )}
          </AgreementItem>
          <AgreementItem isChecked={isBoxThreeChecked} setIsChecked={setIsBoxThreeChecked}>
            {t(
              'Magic is not responsible for and will not provide customer service for any other wallet software you may use this private key with, and that Magic does not represent that any other software or hardware will be compatible with or protect your private\u00A0key.',
            )}
          </AgreementItem>
        </VStack>
        <Box w="full" mb={2}>
          <Button
            expand
            label={t(BUTTON[type])}
            onPress={handlePressRevealKey}
            disabled={!isBoxOneChecked || !isBoxTwoChecked || !isBoxThreeChecked || isRevealKeyPressed}
            validating={isRevealKeyPressed}
            aria-label={BUTTON[type]}
          />
        </Box>
      </Page.Content>
    </>
  );
}
