'use client';

import { useTranslation } from '@common/i18n';
import { useCountdownTimer } from '@hooks/common/email-link';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { Button, EmailWbr, IcoHourglass, Page, Text } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';

export default function LoginWithEmailLinkTryAgain() {
  const { t } = useTranslation('send');

  const router = useSendRouter();
  const { isRunning, secondsLeft } = useCountdownTimer(5);

  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const email = activeRpcPayload?.params?.[0]?.email as string;

  return (
    <>
      <Page.Icon>
        <IcoHourglass />
      </Page.Icon>
      <Page.Content>
        <Text.H4>{t('Try again later')}</Text.H4>
        {isRunning ? (
          <Text>
            {t('Please wait {{secondsLeft}}s before sending another email.', { secondsLeft: secondsLeft.toString() })}
          </Text>
        ) : (
          <>
            <Text>{t('Please send another magic link to')}</Text>
            <Text styles={{ textAlign: 'center' }}>
              <EmailWbr email={email} />
            </Text>
          </>
        )}
        <Box mt={1}></Box>
        <Button
          label={t('Resend Email')}
          onPress={() => {
            router.replace('/send/rpc/auth/magic_auth_login_with_magic_link/start');
          }}
          disabled={isRunning}
          size="md"
          variant="primary"
        />
      </Page.Content>
    </>
  );
}
