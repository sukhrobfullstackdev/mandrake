'use client';

import PassportCheckmark from '@app/passport/rpc/user/components/passport-checkmark';
import PassportLoadingSpinner from '@app/passport/rpc/user/components/passport-loading-spinner';
import { usePassportRouter } from '@hooks/common/passport-router';
import { resolvePopupRequest } from '@hooks/common/popup/popup-json-rpc-request';
import { usePassportEmailLoginStart } from '@hooks/data/passport/email-otp-start';
import { usePassportVerifyOTPMutation } from '@hooks/data/passport/email-otp-verify';
import { usePassportAuthorizeMutation } from '@hooks/data/passport/oauth-authorize';
import { usePassportOauthTokenMutation } from '@hooks/data/passport/oauth-token';
import { usePassportStore } from '@hooks/data/passport/store';
import { useTranslation } from '@lib/common/i18n';
import { Button, IcoEditEmail, IcoEmail, PassportPage, Text, VerifyPincode } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PassportVerifyOTPCodePage() {
  const { t } = useTranslation('passport');
  const router = usePassportRouter();
  const searchParams = useSearchParams();
  const email = decodeURIComponent(searchParams.get('email') as string);
  const [factorId, setFactorId] = useState(decodeURIComponent(searchParams.get('factorId') as string));

  const { mutate: mutateLoginStart } = usePassportEmailLoginStart();

  const {
    mutate: mutatePassportVerifyOTP,
    isPending: isVerifyOtpPending,
    error: isVerifyOtpError,
    isSuccess: isVerifyOtpSuccess,
    reset: resetVerifyOtp,
  } = usePassportVerifyOTPMutation();

  const {
    mutate: mutatePassportAuthorize,
    isPending: isPassportAuthorizationPending,
    error: isPassportAuthorizationError,
    isSuccess: isPassportAuthorizationSuccess,
    reset: resetPassportAuthorize,
  } = usePassportAuthorizeMutation();

  const {
    mutate: mutatePassportOauthToken,
    isPending: isPassportTokenPending,
    error: isPassportTokenError,
    isSuccess: isPassportTokenSuccess,
    reset: resetPassportToken,
  } = usePassportOauthTokenMutation();

  const [errorMessage, setErrorMessage] = useState('');
  const [showButton, setShowButton] = useState(true);
  const [oauthTokenFetched, setOauthTokenFetched] = useState(false);

  const handleError = (e: Error) => {
    if (e.message === 'invalid code') {
      setErrorMessage(t('Invalid code. Please try again.'));
      setShowButton(true);
    } else if (e.message === 'expired code') {
      setErrorMessage(t('Code has expired.'));
      setShowButton(true);
    } else {
      setErrorMessage(e.message);
      setShowButton(true);
    }
  };

  // TODO: how do we want to persist tokens sent from backend
  const persistPassportState = ({ rt, st }: { rt: string; st: string }) => {
    usePassportStore.setState({
      refreshToken: rt,
      accessToken: st,
    });
  };

  const handleEditEmail = () => {
    router.replace('/passport/rpc/user/magic_passport_user_connect');
  };

  const handleVerifyOtp = (code: string) => {
    mutatePassportVerifyOTP(
      {
        challengeResponse: code,
        factorId,
      },
      {
        onSuccess: response => {
          persistPassportState({ rt: response.refreshToken, st: response.sessionToken });

          setTimeout(() => {
            mutatePassportAuthorize(
              // TODO: implement when endpoint is ready [M2PB-26]
              {
                redirectUri: 'string',
                codeChallenge: 'string',
                scope: 'string',
                state: 'string',
                responseType: 'string',
              },
              {
                onSuccess: authorizeResponse => {
                  // TODO: implement when endpoint is ready [M2PB-27]
                  const permissionsGranted = false;
                  if (permissionsGranted) {
                    mutatePassportOauthToken(
                      {
                        grantType: 'authorization_code',
                        code: 'string',
                        redirectUri: 'string',
                        codeVerifier: 'string',
                      },
                      {
                        onSuccess: token => {
                          setOauthTokenFetched(true);
                          setTimeout(() => {
                            resolvePopupRequest(token);
                          }, 500);
                        },
                        onError: handleError,
                      },
                    );
                  } else {
                    router.push(
                      `/passport/rpc/user/permissions?authorizeCode=${encodeURIComponent(authorizeResponse.code)}`,
                    );
                  }
                },
                onError: handleError,
              },
            );
          }, 500);
        },
        onError: handleError,
      },
    );
  };

  const onCompleteOtp = (code: string) => {
    if (!factorId) {
      handleError(new Error('Missing factor ID.'));
      return;
    }
    handleVerifyOtp(code);
  };

  const onChangeOtp = () => {
    if (errorMessage) {
      resetVerifyOtp();
      resetPassportAuthorize();
      resetPassportToken();
    }
    setErrorMessage('');
    setShowButton(false);
  };

  const onRequestNewCodePress = () => {
    mutateLoginStart(
      {
        type: 'email',
        value: email,
      },
      {
        onSuccess: data => {
          setFactorId(data.factorId);
        },
        onError: error => {
          logger.error(error);
          setErrorMessage(t(error.message));
        },
      },
    );
  };

  useEffect(() => {
    if (isVerifyOtpError) {
      handleError(isVerifyOtpError);
    }
    if (isPassportAuthorizationError) {
      handleError(isPassportAuthorizationError);
    }
    if (isPassportTokenError) {
      handleError(isPassportTokenError);
    }
  }, [isVerifyOtpError, isPassportAuthorizationError, isPassportTokenError]);

  if (
    isPassportAuthorizationPending ||
    isPassportTokenPending ||
    (isPassportAuthorizationSuccess &&
      !isPassportTokenSuccess &&
      !isPassportTokenError &&
      !isPassportAuthorizationError)
  ) {
    return <PassportLoadingSpinner />;
  }

  if (oauthTokenFetched) {
    return <PassportCheckmark />;
  }

  const VerifyPincodeInput = () => {
    return (
      <VerifyPincode
        originName="email"
        pinLength={6}
        isPending={isVerifyOtpPending}
        isSuccess={isVerifyOtpSuccess && !isPassportAuthorizationError && !isPassportTokenError}
        onChange={onChangeOtp}
        onComplete={onCompleteOtp}
        errorMessage={errorMessage}
      >
        <VerifyPincode.RetryContent>
          {showButton && <Button size="sm" variant="text" onPress={onRequestNewCodePress} label="Get new code" />}
        </VerifyPincode.RetryContent>
      </VerifyPincode>
    );
  };

  return (
    <PassportPage.Content>
      <IcoEmail height={36} width={36} />
      <Text.H4>Verification code</Text.H4>
      <Text size="sm" styles={{ color: '#FFFFFFB8' }}>
        Please enter the code sent to
        <br />
        <span style={{ color: '#fff', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center' }}>
          {email}{' '}
          <span
            style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', marginLeft: '4px' }}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleEditEmail();
              }
            }}
            onClick={handleEditEmail}
          >
            <IcoEditEmail height={16} width={16} color={'#A799FF'} />
          </span>
        </span>
      </Text>
      <Box mt={'0.5rem'} maxW={'18.75rem'}>
        <VerifyPincodeInput />
      </Box>
    </PassportPage.Content>
  );
}
