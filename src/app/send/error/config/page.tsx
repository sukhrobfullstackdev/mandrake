'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useAppName, useCustomBrandingType } from '@hooks/common/client-config';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { getFooterLabel, useLocale } from '@hooks/common/locale';
import { getQueryClient } from '@lib/common/query-client';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { Button, Header, IcoDismiss, IcoWarning, Page, Text } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import useTranslation from 'next-translate/useTranslation';
import { useEffect } from 'react';

export default function ConfigFailedPage() {
  const queryClient = getQueryClient();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const locale = useLocale();
  const customBrandingType = useCustomBrandingType();
  const appName = useAppName();
  const { t } = useTranslation('send');

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.FailedToFetchConfig);
  };

  useEffect(() => {
    IFrameMessageService.showOverlay();
  }, []);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Page backgroundType="blurred">
        <Page.Header>
          <Header.RightAction>
            <Button size="sm" variant="neutral" onPress={handleClose}>
              <Button.TrailingIcon>
                <IcoDismiss />
              </Button.TrailingIcon>
            </Button>
          </Header.RightAction>
        </Page.Header>
        <Page.Content>
          <IcoWarning height={50} width={50} color={token('colors.warning.base')} />
          <Text.H4>{t('Technical Error')}</Text.H4>
          <Text styles={{ textAlign: 'center' }}>{t('Please close this window and try again.')}</Text>
          <Text styles={{ textAlign: 'center' }}>
            {t('If the problem persists, try refreshing the page or contact {{appName}} for help.', {
              appName: appName || 'support',
            })}
          </Text>
        </Page.Content>
        <Page.Footer showLogo={customBrandingType !== 2} label={getFooterLabel(locale)} />
      </Page>
    </HydrationBoundary>
  );
}
