'use client';

import { useTranslation } from '@common/i18n';
import ApiErrorText from '@components/api-error-text';
import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useAppName } from '@hooks/common/client-config';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import {
  RecoveryMethodType,
  useDeleteRecoveryFactorMutation,
  useGetRecoveryFactorsQuery,
} from '@hooks/data/embedded/account-recovery';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { Button, Header, IcoArrowLeft, IcoDismiss, IcoWarning, Page, Text } from '@magiclabs/ui-components';
import { HStack, VStack } from '@styled/jsx';
import { token } from '@styled/tokens';

export default function RemovePhoneNumber() {
  const router = useSendRouter();
  const { t } = useTranslation('send');
  const appName = useAppName();
  const authUserId = useStore(state => state.authUserId);
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { mutateAsync: getFactor } = useGetRecoveryFactorsQuery();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;
  const showUI = activeRpcPayload?.params?.[0]?.showUI;
  const { mutateAsync: deleteFactor, isPending, error } = useDeleteRecoveryFactorMutation();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const deletePhoneNumber = async () => {
    if (authUserId) {
      const recoveryFactorList = await getFactor(authUserId);

      const { id } = Object.values(recoveryFactorList).find(f => f.type === RecoveryMethodType.PhoneNumber)!;

      if (activeRpcPayload && !(showUI === false && deeplinkPage === 'recovery')) {
        activeRpcPayload.params = [];
      }
      await deleteFactor(
        { authUserId, factorId: id },
        {
          onSuccess: () => {
            if (deeplinkPage) {
              resolveActiveRpcRequest(true);
            } else {
              router.replace('/send/rpc/user/magic_auth_settings');
            }
          },
        },
      );
    }
  };

  const handleBack = () => {
    router.replace('/send/rpc/user/update_phone_number/input_new_phone_number');
  };

  const handleClose = () => {
    if (deeplinkPage) {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
        closedByUser: true,
      });
    } else {
      router.replace('/send/rpc/user/magic_auth_settings');
    }
  };

  return (
    <Page backgroundType="blurred">
      <Page.Header>
        <Header.LeftAction>
          <Button variant="neutral" size="sm" onPress={handleBack} aria-label="back">
            <Button.LeadingIcon>
              <IcoArrowLeft />
            </Button.LeadingIcon>
          </Button>
        </Header.LeftAction>
        <Header.RightAction>
          <Button variant="neutral" size="sm" onPress={handleClose} aria-label="close">
            <Button.TrailingIcon>
              <IcoDismiss />
            </Button.TrailingIcon>
          </Button>
        </Header.RightAction>
      </Page.Header>
      <Page.Icon>
        <IcoWarning color={token('colors.negative.base')} />
      </Page.Icon>
      <Page.Content>
        <VStack mt={2}>
          <Text.H4>{t('Remove phone number?')}</Text.H4>
          <Text styles={{ textAlign: 'center' }}>
            {t('You will no longer be able to access {{appName}} using your phone number', { appName })}
          </Text>
          {error && <ApiErrorText errorCode={error?.response?.error_code} />}
          <HStack w="full" mt={4}>
            <Button expand={true} label={t('Cancel')} variant="neutral" onPress={handleBack} aria-label="cancel" />
            <Button
              expand={true}
              validating={isPending}
              label={t('Remove')}
              variant="negative"
              onPress={deletePhoneNumber}
              aria-label="remove phone number"
            />
          </HStack>
        </VStack>
      </Page.Content>
      <PageFooter />
    </Page>
  );
}
