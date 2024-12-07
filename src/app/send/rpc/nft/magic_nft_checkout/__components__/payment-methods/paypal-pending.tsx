import { T, useTranslation } from '@lib/common/i18n';
import { IconMagicLogo, LogoPayPal, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, Center, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

export const PaypalPending = () => {
  const { t } = useTranslation('send');

  return (
    <VStack pos="absolute" top={0} left={0} right={0} w="full" zIndex={1000} bgColor="surface.primary" mt={3}>
      <VStack gap={6}>
        <HStack gap={4} alignItems="center">
          <IconMagicLogo width={48} height={48} />
          <HStack gap={1}>
            {Array.from({ length: 4 }, (_, index) => (
              <Box key={index} w={1} h={1} bgColor="text.tertiary" borderRadius="full" />
            ))}
          </HStack>
          <Center borderRadius="full" bgColor="yellow.400" width={12} height={12}>
            <LogoPayPal width={28} height={28} />
          </Center>
        </HStack>

        <VStack gap={2}>
          <Text styles={{ fontWeight: 700, fontSize: '1.25rem' }}>{t('Continue with PayPal')}</Text>
          <Text size="lg" styles={{ fontWeight: 400, color: token('colors.text.tertiary'), textAlign: 'center' }}>
            <T ns="send" translate="Please continue to <paypal/> to complete transaction.">
              <span
                id="paypal"
                className={css({
                  color: 'brand.base',
                  fontWeight: 600,
                })}
              >
                {t('PayPal')}
              </span>
            </T>
          </Text>
        </VStack>
      </VStack>
    </VStack>
  );
};
