'use client';

import { useEmailLinkConfirmContext } from '@app/confirm/email-link-confirm-context';
import { useTranslation } from '@common/i18n';
import ApiErrorText from '@components/api-error-text';
import { EmailLinkConfirmErrorState } from '@constants/email-link';
import { MagicApiErrorCode } from '@constants/error';
import { useAppName, useAssetUri } from '@hooks/common/client-config';
import { useEmailLinkLoginVerifyQuery } from '@hooks/data/embedded/email-link';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import {
  ClientAssetLogo,
  IcoCheckmarkCircleFill,
  LoadingSpinner,
  Page,
  PinCodeInput,
  Text,
} from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useRouter } from 'next/navigation';

export default function EmailLinkConfirmSecurityOtpChallenge() {
  const { t } = useTranslation('confirm');
  const appName = useAppName();
  const confirmContext = useEmailLinkConfirmContext();
  const assetUri = useAssetUri();
  const router = useRouter();

  const { tlt, e: env } = confirmContext;

  const {
    mutate: mutateEmailLinkLoginVerify,
    isPending,
    reset,
    isSuccess: isSuccess,
    error,
  } = useEmailLinkLoginVerifyQuery();
  const errorCode = error?.response?.error_code;

  const onCompleteOtp = (oneTimePasscode: string) => {
    mutateEmailLinkLoginVerify(
      { tlt: tlt!, env: env || 'testnet', oneTimePasscode },
      {
        onSuccess: () => {
          setTimeout(() => {
            router.push('/confirm/success');
          }, 2000);
        },
        onError: (e: ApiResponseError) => {
          if (e.response?.error_code === MagicApiErrorCode.MAX_ATTEMPTS_EXCEEDED) {
            router.push(`/confirm/error?errorType=${EmailLinkConfirmErrorState.AuthExpired}`);
          }
        },
      },
    );
  };

  const onChangeOtp = () => {
    // if a user types in the input, we need to reset the error state
    if (error) reset();
  };

  const getPinCodeInputOrStatus = () => {
    if (isPending) return <LoadingSpinner size={36} strokeWidth={4} />;

    if (isSuccess) return <IcoCheckmarkCircleFill color={token('colors.brand.base')} width={36} height={36} />;

    return <PinCodeInput originName="email" onChange={onChangeOtp} pinLength={3} onComplete={onCompleteOtp} />;
  };

  return (
    <>
      <Page.Icon>
        <ClientAssetLogo assetUri={assetUri || ''} />
      </Page.Icon>
      <Page.Content>
        <VStack gap={2}>
          <Text.H4 styles={{ textAlign: 'center' }}>{t(`Enter the security code displayed by ${appName}`)}</Text.H4>
          <VStack gap={3} mt={3} mb={1}>
            {getPinCodeInputOrStatus()}
          </VStack>
          {errorCode && (
            <>
              {errorCode !== MagicApiErrorCode.DEVICE_NOT_VERIFIED && (
                <ApiErrorText errorCode={error?.response?.error_code} />
              )}
            </>
          )}
        </VStack>
      </Page.Content>
    </>
  );
}
