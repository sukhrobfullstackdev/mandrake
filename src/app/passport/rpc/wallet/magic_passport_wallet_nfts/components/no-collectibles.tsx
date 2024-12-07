import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';

export default function NoCollectibles() {
  const { t } = useTranslation('passport');

  return (
    <VStack p={10} gap={3}>
      <Text.H3 fontColor="text.tertiary">{t('No Collectibles')}</Text.H3>
      <Text size="sm" fontColor="text.tertiary">
        {t('You do not own any digital collectibles')}
      </Text>
    </VStack>
  );
}
