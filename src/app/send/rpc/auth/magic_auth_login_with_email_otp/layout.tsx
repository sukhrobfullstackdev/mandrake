'use client';

import { LoginProvider } from '@app/send/login-context';
import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { Button, Header, IcoDismiss, Page } from '@magiclabs/ui-components';

export default function LoginWithEmailOtpLayout({ children }: { children: React.ReactNode }) {
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
      closedByUser: true,
    });
  };

  return (
    <LoginProvider>
      <Page overlay={false}>
        <Page.Header>
          <Header.RightAction>
            <Button size="sm" variant="neutral" onPress={handleClose}>
              <Button.TrailingIcon>
                <IcoDismiss />
              </Button.TrailingIcon>
            </Button>
          </Header.RightAction>
        </Page.Header>
        {children}
        <PageFooter />
      </Page>
    </LoginProvider>
  );
}
