'use client';

import { LoginProvider } from '@app/send/login-context';
import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { getQueryClient } from '@lib/common/query-client';
import { Button, Header, IcoDismiss, Page } from '@magiclabs/ui-components';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export default function LoginWithEmailLinkLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
      closedByUser: true,
    });
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LoginProvider>
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
          {children}
          <PageFooter />
        </Page>
      </LoginProvider>
    </HydrationBoundary>
  );
}
