import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useDeviceVerificationRedirect } from '@hooks/common/device-verification-redirect';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { Button, IcoExpiration, Page, Text } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';

const DeviceVerificationExpired = () => {
  const { t } = useTranslation('send');
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { redirectBackToAuthFlow } = useDeviceVerificationRedirect();

  const resendButtonLabel = (method: string | undefined) => {
    switch (method) {
      case 'magic_auth_login_with_email_otp':
        return t('Resend email');
      case 'magic_auth_login_with_sms':
        return t('Resend SMS');
      default:
        return t('Close');
    }
  };

  const handleResend = () => {
    if (activeRpcPayload?.method) {
      redirectBackToAuthFlow();
    } else {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
        closedByUser: true,
      });
    }
  };

  return (
    <>
      <Page.Icon>
        <IcoExpiration />
      </Page.Icon>
      <Page.Content>
        <Text.H4
          styles={{
            textAlign: 'center',
          }}
        >
          {t('Link expired')}
        </Text.H4>
        <Text styles={{ textAlign: 'center' }}>
          Your login approval link has expired. Request a new one to continue.
        </Text>
        <Box width="full" mt={4}>
          <Button expand label={resendButtonLabel(activeRpcPayload?.method)} onPress={handleResend} />
        </Box>
      </Page.Content>
    </>
  );
};

export default DeviceVerificationExpired;
