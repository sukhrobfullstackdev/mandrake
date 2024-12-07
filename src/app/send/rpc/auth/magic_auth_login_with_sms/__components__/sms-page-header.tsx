import { useLoginContext } from '@app/send/login-context';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { Button, Header, IcoDismiss, Page } from '@magiclabs/ui-components';

export default function SmsPageHeader() {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const loginContext = useLoginContext();

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InvalidRequest, RpcErrorMessage.UserDeniedAccountAccess);
  };

  return (
    <Page.Header data-testid="sms-page-header">
      {loginContext.showCloseButton && (
        <Header.RightAction>
          <Button size="sm" variant="neutral" onPress={handleClose}>
            <Button.TrailingIcon>
              <IcoDismiss data-testid="sms-page-header-dismiss-icon" />
            </Button.TrailingIcon>
          </Button>
        </Header.RightAction>
      )}
    </Page.Header>
  );
}
