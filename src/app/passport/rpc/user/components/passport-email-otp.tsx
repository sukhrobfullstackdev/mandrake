'use client';

import { useFlags } from '@hooks/common/launch-darkly';
import { usePassportRouter } from '@hooks/common/passport-router';
import { usePassportEmailLoginStart } from '@hooks/data/passport/email-otp-start';
import { useTranslation } from '@lib/common/i18n';
import { isValidEmail } from '@lib/utils/validators';
import { IcoArrowRight, LoadingSpinner, TextInput } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import { useState } from 'react';

export default function PassportEmailOtp() {
  const { t } = useTranslation('passport');
  const router = usePassportRouter();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { mutate: mutatePassportEmailLoginStart, isPending, isSuccess } = usePassportEmailLoginStart();
  const flags = useFlags();

  const handleEmailInput = (e: string) => {
    setEmail(e);
    setErrorMessage('');
  };

  const handleEmailSubmit = () => {
    if (!email) return setErrorMessage(t('Please enter an email address.'));
    if (!isValidEmail(email)) return setErrorMessage(t('Invalid email address. Please try again.'));
    setErrorMessage('');

    mutatePassportEmailLoginStart(
      { type: 'email', value: email },
      {
        onSuccess: data => {
          router.replace(
            `/passport/rpc/user/magic_passport_user_connect/verify_otp_code?email=${encodeURIComponent(email)}&factorId=${data.factorId}`,
          );
        },
        onError: error => {
          setErrorMessage(error.message);
          logger.error(error);
        },
      },
    );
  };

  return (
    <>
      {flags?.isMagicPassportEmailOtpLoginEnabled && (
        <Box w="100%" maxW="25rem">
          <TextInput
            disabled={isPending || isSuccess}
            placeholder={t('Email address')}
            onChange={handleEmailInput}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleEmailSubmit();
              }
            }}
            value={email}
            errorMessage={errorMessage}
          >
            <TextInput.ActionIcon onClick={handleEmailSubmit}>
              {isPending || isSuccess ? <LoadingSpinner size={20} strokeWidth={2} /> : <IcoArrowRight />}
            </TextInput.ActionIcon>
          </TextInput>
        </Box>
      )}
    </>
  );
}
