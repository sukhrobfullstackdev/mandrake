import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';

export function SmsRecoverContentHeader({ phoneNumber }: { phoneNumber: string }) {
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
        {phoneNumber}
      </Text.H4>
    </VStack>
  );
}
