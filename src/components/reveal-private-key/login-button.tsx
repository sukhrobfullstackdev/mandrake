import { LoginArg, LoginProvider } from '@components/reveal-private-key/__type__';
import { LOGIN_FORM_ICONS } from '@constants/login-form';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { capitalize } from '@lib/utils/string-utils';
import { Button } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';
import useTranslation from 'next-translate/useTranslation';
import { ComponentType, useCallback } from 'react';

interface LoginButtonProps {
  loginType: LoginProvider;
  loginArg: LoginArg;
  setFocusedProvider: (provider: LoginProvider) => void;
}

interface LoginIcons {
  [key: string]: ComponentType;
}

const loginIcons: LoginIcons = LOGIN_FORM_ICONS;

const LoginButton = ({ loginType, loginArg, setFocusedProvider }: LoginButtonProps) => {
  const { t } = useTranslation('send');
  const buttonLabel = t(capitalize(loginArg));
  const ButtonIcon = loginIcons[loginArg];
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const isMonoIcon = loginArg === 'apple' || loginArg === 'github' || loginArg === 'twitter';

  const handleOnPress = useCallback(() => {
    switch (loginType) {
      case LoginProvider.LINK:
      case LoginProvider.SMS:
      case LoginProvider.WEBAUTHN:
        return setFocusedProvider(loginType);

      default:
        return resolveActiveRpcRequest([loginType, loginArg]);
    }
  }, [loginType, setFocusedProvider]);

  return (
    <Button expand variant="tertiary" label={buttonLabel} aria-label={`${loginArg} login`} onPress={handleOnPress}>
      <Button.LeadingIcon color={isMonoIcon ? token('colors.text.primary') : ''}>
        <ButtonIcon />
      </Button.LeadingIcon>
    </Button>
  );
};

export default LoginButton;
