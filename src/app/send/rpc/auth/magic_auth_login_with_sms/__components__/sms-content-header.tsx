import { useTranslation } from '@common/i18n';
import { Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import parsePhoneNumber from 'libphonenumber-js';

export default function SmsContentHeader({ phoneNumber }: { phoneNumber: string }) {
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
          fontWeight: '600',
        }}
      >
        {parsePhoneNumber(phoneNumber)?.formatInternational()}
      </Text.H4>
    </VStack>
  );
}
