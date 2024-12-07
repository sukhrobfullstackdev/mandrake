import StatusHeader from '@app/send/rpc/kda/__components__/status-header';
import StatusIcon from '@app/send/rpc/kda/__components__/status-icon';
import { useTranslation } from '@lib/common/i18n';
import { Button, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';

interface SpireKeyStatusProps {
  isPending: boolean;
  isConfirming?: boolean;
  errorMessage: string;
  defaultText: string;
  retryCallback: () => void;
}

const SpireKeyStatus = ({ isPending, isConfirming, errorMessage, defaultText, retryCallback }: SpireKeyStatusProps) => {
  const { t } = useTranslation('send');

  return (
    <VStack gap={6} mb={2}>
      <StatusIcon isPending={isPending} isConfirming={isConfirming} isError={!!errorMessage} />
      <VStack minH="76px" gap={3}>
        <StatusHeader isPending={isPending} isConfirming={isConfirming} errorMessage={errorMessage} />
        {(isPending || errorMessage) && (
          <Text fontColor="text.tertiary" styles={{ textAlign: 'center', maxWidth: '250px' }}>
            {errorMessage ? errorMessage : defaultText}
          </Text>
        )}
        {errorMessage && <Button variant="text" onPress={retryCallback} label={t('Please try again')} />}
      </VStack>
    </VStack>
  );
};

export default SpireKeyStatus;
