import { AppNameCollapsible } from '@components/sign-typed-data/sign-typed-data-page';
import { ActionStatus } from '@custom-types/confirm-action';
import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { EIP712TypedData } from 'eth-sig-util';
import { RecursivelyRenderedMessage } from '@components/sign-typed-data/recursively-rendered-message';

interface Props {
  appName: string;
  message: EIP712TypedData | string;
  requestDomain?: string;
  actionStatus: ActionStatus;
}

function parsePotentialJSON(jsonString: EIP712TypedData | string) {
  try {
    if (typeof jsonString !== 'string') return jsonString;
    const data = JSON.parse(jsonString);
    return data;
  } catch (e) {
    return null;
  }
}

export const YouCanSafelyGoBackToApp = ({ appName }: { appName: string }) => {
  const { t } = useTranslation('common');

  return <Text>{t('You can safely close this window and go back to {{appName}}.', { appName })}</Text>;
};

export const SignMessageDetails = ({ appName, message, requestDomain, actionStatus }: Props) => {
  const { t } = useTranslation('common');

  const messageToDisplay = parsePotentialJSON(message) || message;

  if (actionStatus === 'REJECTED') {
    return (
      <>
        <VStack gap={4}>
          <Text>{t('You rejected the signature')}</Text>
          <YouCanSafelyGoBackToApp appName={appName} />
        </VStack>
      </>
    );
  }

  if (actionStatus === 'APPROVED') {
    return (
      <>
        <VStack gap={4}>
          <Text>{t('You successfully approved the signature!')}</Text>
          <YouCanSafelyGoBackToApp appName={appName} />
        </VStack>
      </>
    );
  }

  return (
    <>
      <Text size="lg" fontWeight="medium" styles={{ textAlign: 'center' }}>
        {t('Confirm your {{appName}} signature', { appName })}
      </Text>
      <AppNameCollapsible appName={appName} domainOrigin={requestDomain}>
        <RecursivelyRenderedMessage m={messageToDisplay} />
      </AppNameCollapsible>
    </>
  );
};
