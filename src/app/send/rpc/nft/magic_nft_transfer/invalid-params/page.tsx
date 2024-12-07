'use client';

import { ImageWithIcon } from '@app/send/rpc/nft/magic_nft_checkout/__components__/image-with-icon';
import { NFT_NO_IMAGE_DARK_URL, NFT_NO_IMAGE_URL } from '@constants/nft';
import { useColorMode } from '@hooks/common/client-config';
import { useTranslation } from '@lib/common/i18n';
import { Button, IcoWarningFill, Page, Text } from '@magiclabs/ui-components';
import { Spacer, VStack } from '@styled/jsx';

export default function CollectibleTransferInvalidParamsPage() {
  const { t } = useTranslation('send');
  const theme = useColorMode();
  const isDarkTheme = theme === 'dark';
  const defaultImageUrl = isDarkTheme ? NFT_NO_IMAGE_DARK_URL : NFT_NO_IMAGE_URL;

  const handleClose = () => {
    window.close();
  };
  return (
    <Page.Content>
      <VStack width="full" alignItems="center">
        <ImageWithIcon src={defaultImageUrl} alt={t('Not Supported')}>
          <IcoWarningFill width={40} height={40} color="white" />
        </ImageWithIcon>
        <Spacer mt={4} />
        <Text.H3>{t('Invalid request')}</Text.H3>
        <Text variant="text" size="md" styles={{ textAlign: 'center' }}>
          {t('Your request is invalid. Please try again.')}
        </Text>
        <Spacer mt={3} />
        <Button label={t('Close')} onPress={handleClose} />
      </VStack>
    </Page.Content>
  );
}
