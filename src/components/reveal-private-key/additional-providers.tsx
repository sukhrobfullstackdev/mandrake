import { LoginArg, LoginProvider, PrimaryLogin } from '@components/reveal-private-key/__type__';
import LoginButton from '@components/reveal-private-key/login-button';
import { useConfiguredAuthProviders } from '@hooks/common/client-config';
import { useTranslation } from '@lib/common/i18n';
import { Text } from '@magiclabs/ui-components';
import { Box, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

const primaryLoginArgs: { [key: string]: PrimaryLogin } = {
  link: PrimaryLogin.EMAIL,
  sms: PrimaryLogin.PHONE,
  webauthn: PrimaryLogin.WEBAUTHN,
};

interface AdditionalProvidersProps {
  focusedProvider: LoginProvider | undefined;
  setFocusedProvider: (provider: LoginProvider) => void;
}

const AdditionalProviders = ({ focusedProvider, setFocusedProvider }: AdditionalProvidersProps) => {
  const { t } = useTranslation('send');
  const providers = useConfiguredAuthProviders();
  const primaryProviders = providers?.primaryLoginProviders;
  const socialProviders = providers?.socialLoginProviders;
  const showSeparator =
    (primaryProviders ?? []).length > 1 || ((primaryProviders ?? []).length > 0 && (socialProviders ?? []).length > 0);

  const filteredPrimaryProviders = primaryProviders?.filter(provider => provider !== focusedProvider);

  return (
    <>
      {showSeparator && (
        <Box my={1}>
          <Text size="xs" styles={{ color: token('colors.text.tertiary') }}>
            {t('OR')}
          </Text>
        </Box>
      )}
      <VStack w="full" gap={3} mb={2} mt={showSeparator ? 0 : 6}>
        {filteredPrimaryProviders?.map(provider => (
          <LoginButton
            key={provider}
            loginType={provider as LoginProvider}
            loginArg={primaryLoginArgs[provider] as LoginArg}
            setFocusedProvider={setFocusedProvider}
          />
        ))}
        {socialProviders?.map(provider => (
          <LoginButton
            key={provider}
            loginType={LoginProvider.OAUTH2}
            loginArg={provider as LoginArg}
            setFocusedProvider={setFocusedProvider}
          />
        ))}
      </VStack>
    </>
  );
};

export default AdditionalProviders;
