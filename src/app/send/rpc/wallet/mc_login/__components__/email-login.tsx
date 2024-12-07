'use client';

import { RELAYER_LAST_LOGGED_IN_WITH_METHOD } from '@app/send/rpc/wallet/mc_login/constants';
import { RpcErrorMessage } from '@constants/json-rpc';
import { ConnectWithUILoginMethod } from '@custom-types/connect-with-ui';
import { useSendRouter } from '@hooks/common/send-router';
import { useStore } from '@hooks/store';
import { isValidEmail } from '@lib/utils/validators';
import { Button, Text, TextInput } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import { vstack } from '@styled/patterns';
import { FormEvent, useState } from 'react';

export default function EmailLoginPage() {
  const router = useSendRouter();
  const [email, setEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(true);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError(RpcErrorMessage.MalformedEmail);
    } else {
      setDisabled(true);
      setIsValidating(true);
      if (useStore.getState().isGlobalAppScope)
        localStorage.setItem(RELAYER_LAST_LOGGED_IN_WITH_METHOD, ConnectWithUILoginMethod.EMAIL);
      router.replace(`/send/rpc/auth/magic_auth_login_with_email_otp?email=${encodeURIComponent(email)}`);
    }
  };

  const handleInput = (e: string) => {
    setError(null);
    setDisabled(!e.length);
    setEmail(e.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={vstack({ w: 'full' })}>
      <Box
        style={{
          width: '100%',
          maxWidth: '25rem',
        }}
      >
        <TextInput aria-label="email input" value={email} onChange={handleInput} placeholder="Email address" />
      </Box>
      {error && (
        <Text variant="error" size="sm">
          {error}
        </Text>
      )}
      <Box
        style={{
          width: '100%',
          maxWidth: '25rem',
        }}
      >
        <Button
          aria-label="login-submit-button"
          variant="primary"
          label="Login / Sign up"
          disabled={disabled}
          validating={isValidating}
          type="submit"
          expand
        />
      </Box>
    </form>
  );
}
