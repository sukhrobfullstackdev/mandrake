import { Text } from '@magiclabs/ui-components';
import useTranslation from 'next-translate/useTranslation';
import { Box } from '@styled/jsx';

export default function SmsHeader({ phoneNumber }: { phoneNumber: string }) {
  const { t } = useTranslation('send');
  return (
    <>
      <Text>{t('Please enter the code sent to')}</Text>
      <Box mb={1}>
        <Text
          styles={{
            fontWeight: '600',
          }}
        >
          {phoneNumber}
        </Text>
      </Box>
    </>
  );
}
