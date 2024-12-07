import { useColorMode } from '@hooks/common/client-config';
import { useTranslation } from '@lib/common/i18n';
import {
  IconArt,
  IconArtDark,
  IconGameController,
  IconGameControllerDark,
  IconMusic,
  IconMusicDark,
  IconTicket,
  IconTicketDark,
  Text,
} from '@magiclabs/ui-components';
import { HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

const NFTPlaceholder = () => {
  const { t } = useTranslation('send');
  const colorMode = useColorMode();

  const PlaceholderIcons = () => {
    if (colorMode === 'dark') {
      return (
        <>
          <IconArtDark />
          <IconGameControllerDark />
          <IconMusicDark />
          <IconTicketDark />
        </>
      );
    } else {
      return (
        <>
          <IconArt />
          <IconGameController />
          <IconMusic />
          <IconTicket />
        </>
      );
    }
  };

  return (
    <VStack w="full" py={6} gap={6} bg={{ base: 'magic.10', _dark: 'magic.30/8' }} rounded="2xl">
      <HStack gap={8}>
        <PlaceholderIcons />
      </HStack>
      <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
        {t('No digital collectibles... Yet')}
      </Text>
    </VStack>
  );
};

export default NFTPlaceholder;
