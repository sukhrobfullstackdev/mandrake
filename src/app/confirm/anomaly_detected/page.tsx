'use client';

import { useEmailLinkConfirmContext } from '@app/confirm/email-link-confirm-context';
import CloseWindowMessage from '@app/confirm/error/__components__/close-window-message';
import { useTranslation } from '@common/i18n';
import { EmailLinkConfirmErrorState } from '@constants/email-link';
import { useEmailLinkAnomalyApprove, useEmailLinkAnomalyBlock } from '@hooks/data/embedded/email-link';
import {
  Button,
  IcoCheckmark,
  IcoDismiss,
  IcoQuestionCircle,
  IcoShieldRejected,
  Page,
  Text,
} from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { decodeBase64 } from '@utils/base64';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function EmailLinkConfirmAnomalyDetected() {
  const { t } = useTranslation('confirm');
  const confirmContext = useEmailLinkConfirmContext();
  const router = useRouter();
  const { tlt, e: env, location } = confirmContext;

  const [isRequestBlocked, setIsRequestBlocked] = useState(false);

  const { mutate: mutateAnomalyApprove } = useEmailLinkAnomalyApprove();
  const { mutate: mutateAnomalyBlock } = useEmailLinkAnomalyBlock();

  const handleAnomalyApprove = () => {
    mutateAnomalyApprove(
      { tlt, env: env || 'testnet' },
      {
        onSuccess: () => {
          router.push(`/confirm/`);
        },
        onError: () => {
          router.push(`/confirm/error?errorType=${EmailLinkConfirmErrorState.InternalError}`);
        },
      },
    );
  };

  const handleAnomalyBlock = () => {
    mutateAnomalyBlock(
      { tlt, env: env || 'testnet' },
      {
        onSuccess: () => {
          setIsRequestBlocked(true);
        },
        onError: () => {
          router.push(`/confirm/error?errorType=${EmailLinkConfirmErrorState.InternalError}`);
        },
      },
    );
  };

  return (
    <Page.Content>
      <Page.Icon>
        {isRequestBlocked ? (
          <IcoShieldRejected color={token('colors.negative.base')} />
        ) : (
          <IcoQuestionCircle color={token('colors.brand.base')} />
        )}
      </Page.Icon>
      <Text.H4> {t(`Is this you?`)}</Text.H4>
      <Text>{t('For your security, please let us know if you recognize this login attempt:')}</Text>
      <VStack
        gap={0}
        width="100%"
        alignItems="flex-start"
        textAlign="initial"
        padding={4}
        bg="neutral.tertiary"
        borderRadius="xl"
        mt={6}
        mb={4}
      >
        <Text size="sm" styles={{ fontWeight: 600 }}>
          {t('Location')}
        </Text>
        <Text size="sm">{decodeBase64(location || '') || t('Unknown')}</Text>
      </VStack>
      {isRequestBlocked ? (
        <CloseWindowMessage />
      ) : (
        <>
          <Button expand label={t('Yes, this was me')} onPress={handleAnomalyApprove} size="md" variant="positive">
            <Button.LeadingIcon>
              <IcoCheckmark />
            </Button.LeadingIcon>
          </Button>
          <Button expand label={t('No, block this login')} onPress={handleAnomalyBlock} size="md" variant="negative">
            <Button.LeadingIcon>
              <IcoDismiss />
            </Button.LeadingIcon>
          </Button>
        </>
      )}
    </Page.Content>
  );
}
