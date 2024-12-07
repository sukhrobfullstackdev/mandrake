import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { Button, Header, IcoDismiss, Page } from '@magiclabs/ui-components';

interface SpireKeyHeaderProps {
  showCloseButton: boolean;
}

const SpireKeyHeader = ({ showCloseButton }: SpireKeyHeaderProps) => {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.UserRejectedAction, RpcErrorMessage.UserCanceledAction);
  };

  return (
    <Page.Header>
      <Header.RightAction>
        {showCloseButton && (
          <Button size="sm" variant="neutral" onPress={handleClose}>
            <Button.LeadingIcon>
              <IcoDismiss />
            </Button.LeadingIcon>
          </Button>
        )}
      </Header.RightAction>
    </Page.Header>
  );
};

export default SpireKeyHeader;
