import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useEmailFromPayloadOrSearchParams } from '@hooks/common/email-from-payload-or-search-params';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { MagicPayloadMethod } from '@magic-sdk/types';
import { EmailWbr, IcoEdit, IcoShield, Page, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { Box, HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';
import parsePhoneNumber from 'libphonenumber-js';
import { ETH_REQUESTACCOUNTS } from '@constants/eth-rpc-methods';

const DeviceVerificationRegistration = () => {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { t } = useTranslation('send');
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const phoneNumberParam = activeRpcPayload?.params?.[0]?.phoneNumber as string;
  const email = useEmailFromPayloadOrSearchParams();
  const router = useSendRouter();

  const handleCancel = () => {
    if (activeRpcPayload?.method === MagicPayloadMethod.Login) {
      return router.replace(`/send/rpc/wallet/${MagicPayloadMethod.Login}`);
    }
    if (activeRpcPayload?.method === ETH_REQUESTACCOUNTS) {
      return router.replace(`/send/rpc/eth/${ETH_REQUESTACCOUNTS}`);
    }
    rejectActiveRpcRequest(RpcErrorCode.UserRequestEditEmail, RpcErrorMessage.UserRequestEditEmail);
  };

  const renderAuthMethod = () => {
    if (phoneNumberParam) {
      return <span>{parsePhoneNumber(phoneNumberParam)?.formatInternational()}</span>;
    }
    if (email) {
      return <EmailWbr email={email} />;
    }

    return null;
  };

  return (
    <>
      <Page.Icon>
        <IcoShield />
      </Page.Icon>
      <Page.Content>
        <Text.H4
          styles={{
            textAlign: 'center',
          }}
        >
          {t('Please register this device to continue.')}
        </Text.H4>
        <>
          <VStack gap={0}>
            <Text
              styles={{
                textAlign: 'center',
                lineHeight: 1.8,
              }}
            >
              {t('We sent a device registration link to')}
            </Text>
            <HStack gap={2}>
              <Text
                styles={{
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                {renderAuthMethod()}
              </Text>
              <button className={css({ cursor: 'pointer' })} onClick={handleCancel}>
                <IcoEdit height={18} width={18} color={token('colors.brand.base')} />
              </button>
            </HStack>
          </VStack>

          <Box mt={4}>
            <Text
              styles={{
                textAlign: 'center',
              }}
            >
              {t('This quick one-time approval will help keep your account secure.')}
            </Text>
          </Box>
        </>
      </Page.Content>
    </>
  );
};

export default DeviceVerificationRegistration;
