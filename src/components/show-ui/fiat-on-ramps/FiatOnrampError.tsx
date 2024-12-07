import { Box, HStack, VStack } from '@styled/jsx';
import { Button, IcoDismiss, Text } from '@magiclabs/ui-components';
import useTranslation from 'next-translate/useTranslation';
import { useApiErrorText } from '@components/api-error-text';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { token } from '@styled/tokens';

interface WalletFiatOnrampStripeProps {
  onBackPress: () => void;
  error: ApiResponseError;
}

const FiatOnrampError = ({ onBackPress, error }: WalletFiatOnrampStripeProps) => {
  const { t } = useTranslation();
  const errorText = useApiErrorText(error.response?.error_code);
  return (
    <>
      <HStack>
        <Box style={{ backgroundColor: token('colors.negative.lightest') }} borderRadius="3xl" padding="2">
          <IcoDismiss color={token('colors.negative.base')} />
        </Box>
      </HStack>
      <VStack width="100%" mt="2">
        <VStack mb="2">
          <Text.H4>{t('Purchase Failed')}</Text.H4>
          <Text styles={{ textAlign: 'center' }}>{errorText}</Text>
        </VStack>
        <Button expand variant="primary" label={t('Back to Wallet')} size="md" onPress={onBackPress} />
      </VStack>
    </>
  );
};

export default FiatOnrampError;
