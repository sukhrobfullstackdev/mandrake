'use client';

import ApiErrorText from '@components/api-error-text';
import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useTranslation } from '@lib/common/i18n';
import { Button, IcoCode, Page } from '@magiclabs/ui-components';
import { Box } from '@styled/jsx';

export default function SmsError() {
  const { t } = useTranslation('send');
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  return (
    <>
      <Page.Icon>
        <IcoCode />
      </Page.Icon>
      <Page.Content>
        <Box mb={1}>
          <ApiErrorText />
        </Box>
        <Button
          size="md"
          variant="primary"
          label={t('Close')}
          onPress={() =>
            rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
              closedByUser: true,
            })
          }
        />
      </Page.Content>
      <PageFooter />
    </>
  );
}
