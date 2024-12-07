import { CopyAddress } from '@app/send/rpc/nft/magic_nft_checkout/__components__/payment-methods/copy-address';
import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { HStack } from '@styled/jsx';
import { token } from '@styled/tokens';

export const SendingTo = () => {
  const { t } = useTranslation('send');

  return (
    <HStack
      justifyContent="space-between"
      pos="absolute"
      top={16}
      w="full"
      px={4}
      h={12}
      borderStyle="solid"
      borderY="thin"
      borderColor="neutral.secondary"
      zIndex={10}
    >
      <Text
        size="sm"
        styles={{
          color: token('colors.text.secondary'),
        }}
      >
        {t('Sending to')}
      </Text>
      <CopyAddress />
    </HStack>
  );
};
