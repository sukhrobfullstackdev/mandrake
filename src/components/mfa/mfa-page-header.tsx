import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { Button, Header, IcoArrowLeft, IcoDismiss, IcoLockLocked, Page } from '@magiclabs/ui-components';

interface MfaPageHeaderProps {
  showCloseButton?: boolean;
  onPressBack?: () => void;
}

const MfaPageHeader = ({ showCloseButton = true, onPressBack }: MfaPageHeaderProps) => {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
      closedByUser: true,
    });
  };

  return (
    <>
      <Page.Header>
        {!!onPressBack && (
          <Header.LeftAction>
            <Button variant="neutral" size="sm" onPress={onPressBack}>
              <Button.LeadingIcon>
                <IcoArrowLeft />
              </Button.LeadingIcon>
            </Button>
          </Header.LeftAction>
        )}
        {showCloseButton && (
          <Header.RightAction>
            <Button variant="neutral" size="sm" onPress={handleClose}>
              <Button.TrailingIcon>
                <IcoDismiss />
              </Button.TrailingIcon>
            </Button>
          </Header.RightAction>
        )}
      </Page.Header>
      <Page.Icon>
        <IcoLockLocked />
      </Page.Icon>
    </>
  );
};

export default MfaPageHeader;
