/* istanbul ignore file */

'use client';

import Menu from '@app/passport/rpc/user/components/header/menu';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { rejectPopupRequest, resolvePopupRequest } from '@hooks/common/popup/popup-json-rpc-request';
import { usePassportAppConfig } from '@hooks/data/passport/app-config';
import { useSmartAccount } from '@hooks/passport/use-smart-account';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { PassportPage, Text } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';
import { token } from '@styled/tokens';
import { useCallback, useEffect, useState } from 'react';

export default function PersonalSign() {
  const { t } = useTranslation('passport');
  const { smartAccount } = useSmartAccount();
  const appConfig = usePassportAppConfig();

  const [isSending, setIsSending] = useState(false);
  const [appReferrer, setAppReferrer] = useState('');
  const [message, setMessage] = useState('');

  const popupPayload = PopupAtomicRpcPayloadService.getActiveRpcPayload();
  const appName = appConfig?.name || '';

  useEffect(() => setAppReferrer(window?.document?.referrer), []);

  useEffect(() => {
    const msg = popupPayload?.params[0];
    if (typeof msg !== 'string') {
      rejectPopupRequest(RpcErrorCode.InvalidParams, RpcErrorMessage.InvalidParams);
    }
    setMessage(msg);
  }, []);

  const handleSignMessage = useCallback(async () => {
    if (smartAccount) {
      setIsSending(true);
      try {
        const signedMessageHex = await smartAccount.signMessage({ message });
        resolvePopupRequest(signedMessageHex);
      } catch (error) {
        rejectPopupRequest(RpcErrorCode.InternalError, RpcErrorMessage.InternalError);
      }
    }
  }, [smartAccount, message]);

  const handleClose = useCallback(() => {
    rejectPopupRequest(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserCanceledAction);
  }, []);

  // Extracting out to fix deepsource `JSX tree is too deeply nested. Found 5 levels of nesting`
  const SignMessageHeader = () => (
    <Box mr={'auto'}>
      <Text.H4 fontColor="text.tertiary">
        <span style={{ color: token('colors.text.primary') }}>{t('Message')}</span> {t('from')} {appName}
      </Text.H4>
    </Box>
  );

  return (
    <PassportPage>
      <PassportPage.Title branding="dark" />
      <PassportPage.Menu>
        <Menu />
      </PassportPage.Menu>
      <PassportPage.Header name={appName} domain={appReferrer} />
      <PassportPage.Content>
        <SignMessageHeader />
        <Box
          mt={'1rem'}
          padding={'0.5rem'}
          width={'100%'}
          maxH={'18.75rem'}
          color="text.tertiary"
          border={'1px solid gray'}
          borderRadius={'0.5rem'}
          overflowWrap={'break-word'}
          whiteSpace={'pre-line'}
          overflowY={'auto'}
        >
          {message}
        </Box>
      </PassportPage.Content>
      <PassportPage.Confirm
        label={t('Confirm')}
        onPress={handleSignMessage}
        disabled={!smartAccount}
        validating={isSending}
      />
      <PassportPage.Cancel label={t('Cancel')} onPress={handleClose} disabled={isSending || !smartAccount} />
    </PassportPage>
  );
}
