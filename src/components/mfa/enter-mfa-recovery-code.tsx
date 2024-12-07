'use client';
import { useTranslation } from '@common/i18n';
import { useApiErrorText } from '@components/api-error-text';
import { MagicApiErrorCode } from '@constants/error';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import {
  Button,
  Callout,
  IcoCheckmarkCircleFill,
  LoadingSpinner,
  Page,
  Text,
  TextInput,
} from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import MfaPageHeader from './mfa-page-header';

interface EnterMfaRecoveryCodeProps {
  isPending: boolean;
  isSuccess: boolean;
  errorCode?: MagicApiErrorCode | null;
  onChangeRecoveryCode: (code: string) => void;
  onPressLostRecoveryCode: () => void;
  onPressBack: () => void;
}

const EnterMfaRecoveryCode = (props: EnterMfaRecoveryCodeProps) => {
  const { isPending, isSuccess, errorCode, onChangeRecoveryCode, onPressLostRecoveryCode, onPressBack } = props;
  const { t } = useTranslation('send');
  const errorMessage = useApiErrorText(errorCode) ?? '';
  const pathname = usePathname();

  useEffect(() => {
    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
  }, []);

  const getRecoveryCodeInputOrStatus = () => {
    if (isSuccess) return <IcoCheckmarkCircleFill height={36} width={36} color={token('colors.brand.base')} />;

    if (isPending) return <LoadingSpinner size={36} strokeWidth={4} />;

    return (
      <>
        <TextInput
          aria-label={t('8-character code')}
          attr={{
            size: 35,
          }}
          placeholder={t('8-character code')}
          onChange={onChangeRecoveryCode}
          alignText="center"
          errorMessage={errorMessage}
        />
        <Callout label={t('2-step verification will be disabled.')} variant="warning" />
      </>
    );
  };

  return (
    <>
      <MfaPageHeader showCloseButton={false} onPressBack={onPressBack} />
      <Page.Content>
        <div className={css({ w: 'full', paddingX: 2 })}>
          <Text.H4
            styles={{
              textAlign: 'center',
              fontWeight: 'normal',
            }}
          >
            {t('Enter your recovery code to log in.')}
          </Text.H4>
        </div>
        <VStack gap={3} my={3}>
          {getRecoveryCodeInputOrStatus()}
        </VStack>
        {!isSuccess && !isPending && (
          <Button variant="text" onPress={onPressLostRecoveryCode} label={t('I lost my recovery code')} />
        )}
      </Page.Content>
    </>
  );
};

export default EnterMfaRecoveryCode;
