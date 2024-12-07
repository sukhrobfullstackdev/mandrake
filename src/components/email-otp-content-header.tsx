'use client';
import { useTranslation } from '@lib/common/i18n';
import { EmailWbr, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';

const EmailOtpContentHeader = ({ email }: { email: string }) => {
  const { t } = useTranslation('send');

  return (
    <VStack gap={0} style={{ marginBottom: '0.625rem' }}>
      <Text.H4
        styles={{
          textAlign: 'center',
          fontWeight: 'normal',
        }}
      >
        {t('Please enter the code sent to')}
      </Text.H4>
      <Text.H4
        styles={{
          textAlign: 'center',
        }}
      >
        <EmailWbr email={email} />
      </Text.H4>
    </VStack>
  );
};

export default EmailOtpContentHeader;
