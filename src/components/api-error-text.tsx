import { useTranslation } from '@common/i18n';
import { MagicApiErrorCode } from '@constants/error';
import { useAppName } from '@hooks/common/client-config';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { Text, TextProps } from '@magiclabs/ui-components';

interface ApiErrorTextProps extends Omit<TextProps, 'children'> {
  errorCode?: MagicApiErrorCode | null;
}

export const useApiErrorText = (errorCode?: MagicApiErrorCode | null) => {
  const { t } = useTranslation('common');
  const { decodedQueryParams } = useStore(state => state);
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const appName = useAppName();
  const email = activeRpcPayload?.params?.[0]?.email;
  const domainOrigin = decodedQueryParams?.domainOrigin;
  if (!errorCode) return null;

  const domainUnauthorizedError = domainOrigin
    ? t('{{appName}} has not approved access for {{domainOrigin}}.', {
        appName,
        domainOrigin,
      })
    : t('{{appName}} has not approved access for the current domain.');

  const errorsMap: Partial<Record<MagicApiErrorCode | string, string>> = {
    [MagicApiErrorCode.LOGIN_THROTTLED]: t('Too many login attempts. Please try again later.'),
    [MagicApiErrorCode.MALFORMED_EMAIL]: t('Please enter a valid email address.'),
    [MagicApiErrorCode.MALFORMED_PHONE_NUMBER]: t(
      'It looks like that phone number is invalid. Please check the number and try again.',
    ),
    [MagicApiErrorCode.INCORRECT_VERIFICATION_CODE]: t('Invalid code, please try again.'),
    [MagicApiErrorCode.RECOVERY_FACTOR_ALREADY_EXISTS]: t('A recovery factor already exists.'),
    [MagicApiErrorCode.INCORRECT_PHONE_VERIFICATION_CODE]: t('Invalid code, please try again.'),
    [MagicApiErrorCode.INCORRECT_TWO_FA_CODE]: t('Invalid code, please try again.'),
    [MagicApiErrorCode.INTERNAL_SERVER_ERROR]: t('An unknown error occurred.'),
    [MagicApiErrorCode.REQUEST_NOT_AUTHORIZED_FOR_DOMAIN]: domainUnauthorizedError,
    [MagicApiErrorCode.UNAUTHORIZED_DOMAIN]: domainUnauthorizedError,
    [MagicApiErrorCode.MAX_ATTEMPTS_EXCEEDED]: t('Security code expired.'),
    [MagicApiErrorCode.VERIFICATION_CODE_EXPIRED]: t('Security code expired.'),
    [MagicApiErrorCode.ANOMALOUS_REQUEST_DETECTED]: t('Access denied.'),
    [MagicApiErrorCode.EMAIL_NOT_ALLOWED]: t('{{email}} does not have any permission to access this app.', {
      email,
    }),
    [MagicApiErrorCode.EMAIL_BLOCKED]: t('Sorry, you don’t have permission to log in to {{appName}}.', {
      appName,
    }),
    [MagicApiErrorCode.INVALID_API_KEY]: t('Given API key is invalid. Please try again.'),
    [MagicApiErrorCode.EXPIRED_AUTH_USER_LOGIN_FLOW]: t('Login has expired. Please restart the flow'),
    [MagicApiErrorCode.FIAT_ON_RAMP_UNSUPPORTED_LOCATION]: t(
      'Link by Stripe is not yet available in your location. Please try again with another payment method.',
    ),
    [MagicApiErrorCode.EXTERNAL_PROVIDER_IS_DOWN]: t(
      'Link by Stripe is currently unavailable. Please try again with another payment method.',
    ),
    [MagicApiErrorCode.AUTH_METHOD_FORBIDDEN]: t('The requested authentication method is unavailable for this app.'),
    [MagicApiErrorCode.MAX_TRIES_EXCEEDED]: t('Too many attempts. Please try again later.'),
    [MagicApiErrorCode.VERIFY_PROVIDER_ERROR]: t('Error verifying. Please try again.'),

    // todo: Add more error messages for other enum values as needed
  };

  return errorsMap[errorCode] || errorsMap[MagicApiErrorCode.INTERNAL_SERVER_ERROR];
};

const ApiErrorText = (props: ApiErrorTextProps) => {
  const { errorCode } = props;
  const errorText = useApiErrorText(errorCode);
  if (!errorText) return null;

  return (
    <Text variant="error" size="sm" styles={{ textAlign: 'center' }} {...props}>
      {errorText}
    </Text>
  );
};

export default ApiErrorText;
