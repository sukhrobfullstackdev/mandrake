import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { MagicPayloadMethod } from '@magic-sdk/types';
import { Button, Header, IcoDismiss, Page } from '@magiclabs/ui-components';

export function UpdateEmailHeader() {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const method = activeRpcPayload?.method;
  const router = useSendRouter();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const deeplinkPage = activeRpcPayload?.params?.[0]?.page;
  const handleClose = () => {
    if (method === MagicPayloadMethod.UserSettings && !deeplinkPage) {
      router.replace('/send/rpc/user/magic_auth_settings');
    } else {
      rejectActiveRpcRequest(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserCanceledAction);
    }
  };

  return (
    <Page.Header>
      <Header.LeftAction>
        <Button size="sm" variant="neutral" onPress={handleClose}>
          <Button.TrailingIcon>
            <IcoDismiss />
          </Button.TrailingIcon>
        </Button>
      </Header.LeftAction>
    </Page.Header>
  );
}
