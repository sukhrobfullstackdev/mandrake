'use client';
import { useTranslation } from '@common/i18n';
import { useApiErrorText } from '@components/api-error-text';
import { MagicApiErrorCode } from '@constants/error';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { LoginWithEmailOTPEventEmit, LoginWithEmailOTPEventOnReceived } from '@magic-sdk/types';
import { Button, Page, Text, VerifyPincode } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import MfaPageHeader from './mfa-page-header';

interface EnterMfaTotpProps {
  onCompleteOtp: (oneTimeCode: string) => void;
  onChangeOtp: (oneTimeCode: string[]) => void;
  onPressLostDevice: () => void;
  isPending: boolean;
  isSuccess: boolean;
  errorCode?: MagicApiErrorCode | null;
  showLostDeviceButton: boolean;
  showCloseButton?: boolean;
}

const EnterMfaTotp = ({
  onCompleteOtp,
  isPending,
  isSuccess,
  errorCode,
  onChangeOtp,
  onPressLostDevice,
  showLostDeviceButton,
  showCloseButton,
}: EnterMfaTotpProps) => {
  const pathname = usePathname();
  const { t } = useTranslation('send');
  const showButton = showLostDeviceButton && !isPending && !isSuccess;
  const errorMessage = useApiErrorText(errorCode) ?? '';
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  useEffect(() => {
    AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
  }, []);

  useEffect(() => {
    if (activeRpcPayload) {
      AtomicRpcPayloadService.onEvent(LoginWithEmailOTPEventEmit.VerifyMFACode, (mfa: unknown) => {
        onCompleteOtp(mfa as string);
      });
      AtomicRpcPayloadService.emitJsonRpcEventResponse(LoginWithEmailOTPEventOnReceived.MfaSentHandle);
    }
  }, [activeRpcPayload]);
  return (
    <>
      <MfaPageHeader showCloseButton={showCloseButton} />
      <Page.Content>
        <Box mb={12} style={{ marginBottom: '0.625rem' }}>
          <Text.H4
            styles={{
              textAlign: 'center',
              fontWeight: 'normal',
            }}
          >
            {t('Please enter the 6-digit code from your authenticator app.')}
          </Text.H4>
        </Box>
        <VerifyPincode
          originName="mfa"
          pinLength={6}
          isPending={isPending}
          isSuccess={isSuccess}
          onChange={onChangeOtp}
          onComplete={onCompleteOtp}
          errorMessage={errorMessage}
        />
        {showButton && <Button variant="text" onPress={onPressLostDevice} label={t('I lost my device')} />}
      </Page.Content>
    </>
  );
};

export default EnterMfaTotp;
