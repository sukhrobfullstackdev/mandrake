'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { useTranslation } from '@lib/common/i18n';
import { isGlobalAppScope } from '@lib/utils/connect-utils';
import { Button, Header, IcoDismiss, Page, Text } from '@magiclabs/ui-components';
import { css } from '@styled/css';
import { token } from '@styled/tokens';
import { useEffect } from 'react';

export default function MCLoginHeader() {
  const { t } = useTranslation('send');
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const isUniversalWallet = isGlobalAppScope();
  const { data: clientConfigData, error: clientConfigError } = useClientConfigQuery(
    { magicApiKey: useStore.getState().magicApiKey || '' },
    { enabled: !!useStore.getState().magicApiKey },
  );
  const router = useSendRouter();

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
      closedByUser: true,
    });
  };

  const prefixText = t(isUniversalWallet ? 'Connect to' : 'Sign in to');
  const appNameStyle = isUniversalWallet ? undefined : css({ fontWeight: 'semibold', color: 'brand.base' });

  useEffect(() => {
    if (clientConfigError) {
      logger.error('LoginFormHeader - Error fetching client config', clientConfigError);
      return router.replace('/send/error/config');
    }
  }, [clientConfigError]);

  return (
    <Page.Header>
      <Header.Content>
        {clientConfigData?.clientTheme.appName ? (
          <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
            {prefixText} <span className={appNameStyle}>{clientConfigData?.clientTheme.appName}</span>
          </Text>
        ) : (
          'Sign in'
        )}
      </Header.Content>
      <Header.RightAction>
        <Button size="sm" variant="neutral" onPress={handleClose}>
          <Button.TrailingIcon>
            <IcoDismiss />
          </Button.TrailingIcon>
        </Button>
      </Header.RightAction>
    </Page.Header>
  );
}
