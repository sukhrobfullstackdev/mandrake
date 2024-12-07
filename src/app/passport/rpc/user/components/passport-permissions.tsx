import { useTranslation } from '@lib/common/i18n';
import { IcoCheckmarkCircleFill, IcoDismissCircle, Text } from '@magiclabs/ui-components';
import { Divider, HStack, Stack } from '@styled/jsx';
import { token } from '@styled/tokens';

export default function PassportPermissions() {
  const { t } = useTranslation('passport');

  return (
    <Stack gap={3}>
      <HStack>
        <IcoCheckmarkCircleFill height={18} width={18} color={token('colors.brand.base')} />
        <Text>{t('View assets and history')}</Text>
      </HStack>
      <Divider color="text.tertiary/20" />
      <HStack>
        <IcoDismissCircle height={18} width={18} color={token('colors.text.tertiary')} />
        <Text fontColor="text.tertiary">{t('Transfer assets')}</Text>
      </HStack>
    </Stack>
  );
}
