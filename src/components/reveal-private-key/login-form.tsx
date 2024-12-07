import { LoginProvider } from '@components/reveal-private-key/__type__';
import { RpcErrorMessage } from '@constants/json-rpc';
import { LoginMethodType } from '@custom-types/api-response';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useTranslation } from '@lib/common/i18n';
import { isValidEmail } from '@lib/utils/validators';
import { Button, PhoneInput, TextInput } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { VStack } from '@styled/jsx';
import { useEffect, useState } from 'react';

const loginMethod: { [key: string]: LoginMethodType } = {
  link: LoginMethodType.EmailLink,
  sms: LoginMethodType.SMS,
  webauthn: LoginMethodType.WebAuthn,
};

interface LoginFormProps {
  focusedProvider: LoginProvider | undefined;
}

const LoginForm = ({ focusedProvider }: LoginFormProps) => {
  const { t } = useTranslation('send');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const formLabel = focusedProvider === LoginProvider.LINK ? t('Email address') : t('Username');

  useEffect(() => {
    setValue('');
    setError('');
  }, [focusedProvider]);

  if (!focusedProvider) {
    return null;
  }

  const handleLogin = () => {
    if (focusedProvider === LoginProvider.LINK && !isValidEmail(value)) {
      return setError(RpcErrorMessage.MalformedEmail);
    }
    resolveActiveRpcRequest([loginMethod[focusedProvider], value]);
  };

  return (
    <VStack w="full" gap={6} minH={32} mt={5} justifyContent="flex-end">
      {focusedProvider === LoginProvider.SMS ? (
        <PhoneInput onChange={setValue} aria-label="phone number" />
      ) : (
        <TextInput
          value={value}
          onChange={setValue}
          className={css({ w: 'full' })}
          placeholder={formLabel}
          aria-label={formLabel}
          errorMessage={error}
        />
      )}

      <Button expand label={t('Log in')} onPress={handleLogin} />
    </VStack>
  );
};

export default LoginForm;
