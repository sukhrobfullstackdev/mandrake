'use client';

import PageFooter from '@components/show-ui/footer';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useChainInfo } from '@hooks/common/chain-info';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { getQueryClient } from '@lib/common/query-client';
import { Button, Header, IcoDismiss, Page, Text } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export default function EthSendGaslessTransactionLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { chainInfo } = useChainInfo();

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
      closedByUser: true,
    });
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Page backgroundType="blurred">
        <Page.Header>
          <Header.Content>
            <Text size="sm" styles={{ color: token('colors.text.tertiary') }}>
              {chainInfo?.networkName}
            </Text>
          </Header.Content>
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
    </HydrationBoundary>
  );
}
