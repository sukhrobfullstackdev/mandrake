import { Box } from '@styled/jsx';
import { Text } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';
import { useTranslation } from '@common/i18n';

export default function CloseWindowMessage() {
  const { t } = useTranslation('send');

  return (
    <Box mt={4}>
      <Text styles={{ color: token('colors.text.tertiary') }}>{t('You can close this window')}</Text>
    </Box>
  );
}
