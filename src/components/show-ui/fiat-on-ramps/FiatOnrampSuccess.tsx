import { HStack, VStack } from '@styled/jsx';
import { Button, IcoCheckmarkCircleFill, Text } from '@magiclabs/ui-components';
import useTranslation from 'next-translate/useTranslation';
import { token } from '@styled/tokens';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ETH_SENDTRANSACTION } from '@constants/eth-rpc-methods';

interface WalletFiatOnrampSuccess {
  onBackPress: () => void;
}

const FiatOnrampSuccess = ({ onBackPress }: WalletFiatOnrampSuccess) => {
  const { t } = useTranslation();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const buttonText = activeRpcPayload?.method.endsWith(ETH_SENDTRANSACTION)
    ? t('Back to transaction')
    : t('Back to wallet');

  return (
    <>
      <HStack>
        <IcoCheckmarkCircleFill height="32" width="32" color={token('colors.positive.base')} />
      </HStack>
      <VStack width="100%" mt="2">
        <VStack mb="2">
          <Text.H4>{t('Purchase Complete')}</Text.H4>
          <Text styles={{ textAlign: 'center' }}>
            {t('It may take a few minutes for your transaction to finish processing.')}
          </Text>
        </VStack>
        <Button expand variant="primary" label={buttonText} size="md" onPress={onBackPress} />
      </VStack>
    </>
  );
};

export default FiatOnrampSuccess;
