'use client';

import { useUpdatePhoneNumberContext } from '@app/send/rpc/user/update_phone_number/update-phone-number-context';
import { useTranslation } from '@common/i18n';
import ApiErrorText from '@components/api-error-text';
import PageFooter from '@components/show-ui/footer';
import { useSendRouter } from '@hooks/common/send-router';
import { useUserMetadata } from '@hooks/common/user-metadata';
import {
  RecoveryMethodType,
  useCreateFactorMutation,
  useFactorChallengeMutation,
  useGetRecoveryFactorsQuery,
  usePatchFactorMutation,
} from '@hooks/data/embedded/account-recovery';
import { RecoveryFactorEventEmit, RecoveryFactorEventOnReceived } from '@magic-sdk/types';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { Button, Header, IcoDismiss, IcoPhone, Page, PhoneInput, Text } from '@magiclabs/ui-components';
import { Box, HStack, VStack } from '@styled/jsx';
import { useEffect, useState } from 'react';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { MagicApiErrorCode } from '@constants/error';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';

export default function InputNewPhoneNumber() {
  const authUserId = useStore(state => state.authUserId);
  const router = useSendRouter();
  const { t } = useTranslation('send');
  const { userMetadata } = useUserMetadata();
  const recoveryPhoneNumber = userMetadata?.recoveryFactors.find(
    factor => factor.type === RecoveryMethodType.PhoneNumber,
  );
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const showUI = activeRpcPayload?.params?.[0]?.showUI;
  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;
  const [phoneNumber, setPhoneNumber] = useState('');
  const updatePhoneNumberContext = useUpdatePhoneNumberContext();
  const { mutateAsync: addFactor, error: addFactorError, isPending: isPendingAddFactor } = useCreateFactorMutation();
  const {
    mutateAsync: getRecoveryFactor,
    error: getRecoveryFactorError,
    isPending: isPendingGetRecoveryFactor,
  } = useGetRecoveryFactorsQuery();
  const { mutateAsync: editFactor, error: editFactorError, isPending: isPendingEditFactor } = usePatchFactorMutation();
  const { mutateAsync: challenge, error: challengeError, isPending: isPendingChallenge } = useFactorChallengeMutation();
  useEffect(() => {
    AtomicRpcPayloadService.onEvent(RecoveryFactorEventEmit.SendNewPhoneNumber, (phone_number: unknown) => {
      setPhoneNumber(phone_number as string);
    });
    AtomicRpcPayloadService.emitJsonRpcEventResponse(RecoveryFactorEventOnReceived.EnterNewPhoneNumber);
  }, []);
  const sendPhoneNumberOtp = async () => {
    try {
      let factorId = '';
      if (!recoveryPhoneNumber?.value) {
        factorId = await addFactor({
          authUserId,
          value: phoneNumber,
          type: RecoveryMethodType.PhoneNumber,
          isRecoveryEnabled: true,
          isAuthenticatedEnabled: true,
          credential: updatePhoneNumberContext.updatePhoneNumberCredential,
        });
      } else {
        const recoveryFactors = await getRecoveryFactor(authUserId as string);
        factorId = await editFactor({
          authUserId,
          value: phoneNumber,
          type: RecoveryMethodType.PhoneNumber,
          factorId: Object.values(recoveryFactors).find(factor => factor.type === RecoveryMethodType.PhoneNumber)?.id,
          isRecoveryEnabled: true,
        });
      }
      const attemptId = await challenge({
        authUserId,
        factorId,
        credential: updatePhoneNumberContext.updatePhoneNumberCredential,
      });

      updatePhoneNumberContext.setUpdatePhoneNumberState({
        ...updatePhoneNumberContext,
        attemptId,
        newPhoneNumber: phoneNumber,
        oldPhoneNumber: recoveryPhoneNumber?.value,
      });
      router.replace('/send/rpc/user/update_phone_number/enter_totp');
    } catch (e) {
      const err = e as ApiResponseError;
      if (err.response?.error_code === MagicApiErrorCode.RECOVERY_FACTOR_ALREADY_EXISTS) {
        AtomicRpcPayloadService.emitJsonRpcEventResponse(RecoveryFactorEventOnReceived.RecoveryFactorAlreadyExists);
      }
      if (err.response?.error_code === MagicApiErrorCode.MALFORMED_PHONE_NUMBER) {
        AtomicRpcPayloadService.emitJsonRpcEventResponse(RecoveryFactorEventOnReceived.MalformedPhoneNumber);
      }
    }
  };
  useEffect(() => {
    if (phoneNumber.length > 2 && showUI === false && deeplinkPage === 'recovery') {
      sendPhoneNumberOtp();
    }
  }, [phoneNumber, showUI]);
  const onRemovePhoneNumberPress = () => {
    router.replace('/send/rpc/user/update_phone_number/remove_phone_number');
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
  const title = recoveryPhoneNumber ? t('Update phone number') : t('Add a phone number');

  return (
    <Page backgroundType="blurred">
      <Page.Header>
        <Header.RightAction>
          <Button size="sm" variant="neutral" onPress={handleClose} aria-label="close">
            <Button.TrailingIcon>
              <IcoDismiss />
            </Button.TrailingIcon>
          </Button>
        </Header.RightAction>
      </Page.Header>
      <Page.Icon>
        <IcoPhone />
      </Page.Icon>
      <Page.Content>
        <VStack mt="2">
          <Text.H4>{title}</Text.H4>
          <Text styles={{ textAlign: 'center' }}>
            {t('This acts as a backup method for accessing your Magic Mobile & OAuth account')}
          </Text>
          <VStack mt="4" px="3" width="100%">
            <Box zIndex={1}>
              <PhoneInput onChange={setPhoneNumber} />
            </Box>
            {(challengeError && <ApiErrorText errorCode={challengeError.response?.error_code} />) ||
              (addFactorError && <ApiErrorText errorCode={addFactorError.response?.error_code} />) ||
              (editFactorError && <ApiErrorText errorCode={editFactorError.response?.error_code} />) ||
              (getRecoveryFactorError && <ApiErrorText errorCode={getRecoveryFactorError.response?.error_code} />)}
            <HStack width="100%" mt="4">
              <Button size="md" expand label="Cancel" variant="neutral" onPress={handleClose} />
              <Button
                size="md"
                expand
                label="Next"
                variant="primary"
                validating={
                  isPendingChallenge || isPendingAddFactor || isPendingEditFactor || isPendingGetRecoveryFactor
                }
                onPress={sendPhoneNumberOtp}
              />
            </HStack>
            {recoveryPhoneNumber && (
              <Box mt={2}>
                <Button
                  variant="text"
                  size="sm"
                  label={t('Remove phone number')}
                  aria-label="remove phone number"
                  onPress={onRemovePhoneNumberPress}
                />
              </Box>
            )}
          </VStack>
        </VStack>
      </Page.Content>
      <PageFooter />
    </Page>
  );
}
