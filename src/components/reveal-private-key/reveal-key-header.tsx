import { RevealViewType } from '@components/reveal-private-key/__type__';
import { LEGACY_FLOW_ROUTE, MWS_FLOW_ROUTE } from '@components/reveal-private-key/constants/reveal-constants';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useApiWalletRejectActiveRpcRequest, useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { ApiWalletAtomicRpcPayloadService, AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { Button, Header, IcoDismiss, Page } from '@magiclabs/ui-components';

interface RevealKeyHeaderProps {
  showLogout?: boolean;
  type?: RevealViewType;
}

const RevealKeyHeader = ({ showLogout = true, type = RevealViewType.REVEAL }: RevealKeyHeaderProps) => {
  const isRevealPage = type === RevealViewType.REVEAL;
  const RejectActiveRpc = isRevealPage ? useRejectActiveRpcRequest : useApiWalletRejectActiveRpcRequest;
  const RpcPayloadService = isRevealPage ? AtomicRpcPayloadService : ApiWalletAtomicRpcPayloadService;
  const rejectActiveRpcRequest = RejectActiveRpc();
  const router = useSendRouter();
  const activeRpcPayload = RpcPayloadService.getActiveRpcPayload();
  const isLegacyFlow = !!activeRpcPayload?.params[0]?.isLegacyFlow;
  const isMwsFlow = !!activeRpcPayload?.params[0]?.isMWS;

  const handleClose = () => {
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
      closedByUser: true,
    });
  };

  const isLegacyFlowVisible = isLegacyFlow && isRevealPage;

  const handleLegacyLogout = () => {
    router.replace(LEGACY_FLOW_ROUTE[type]);
  };

  const handleMwsLogout = () => {
    router.replace(MWS_FLOW_ROUTE[type]);
  };

  const CloseButton = () => {
    if (isLegacyFlowVisible) {
      return (
        <Button
          variant="text"
          size="sm"
          onPress={isMwsFlow ? handleMwsLogout : handleLegacyLogout}
          label="Logout"
          aria-label="Logout"
        />
      );
    }
    return (
      <Button variant="neutral" size="sm" onPress={handleClose} aria-label="close">
        <Button.TrailingIcon>
          <IcoDismiss />
        </Button.TrailingIcon>
      </Button>
    );
  };

  return (
    <Page.Header>
      <Header.RightAction>{showLogout && <CloseButton />}</Header.RightAction>
    </Page.Header>
  );
};

export default RevealKeyHeader;
