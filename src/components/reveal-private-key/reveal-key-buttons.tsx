import { RevealViewType } from '@components/reveal-private-key/__type__';
import { LEGACY_FLOW_ROUTE, MWS_FLOW_ROUTE } from '@components/reveal-private-key/constants/reveal-constants';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useApiWalletRejectActiveRpcRequest, useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { ApiWalletAtomicRpcPayloadService, AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { Button, IcoCopy, IcoEyeClosed, IcoEyeOpened } from '@magiclabs/ui-components';
import { HStack, VStack } from '@styled/jsx';

interface RevealKeyButtonsProps {
  isHidden: boolean;
  isCopied: boolean;
  handleRevealPrivateKey: () => void;
  handleCopy: () => void;
  type?: RevealViewType;
}

const RevealKeyButtons = ({
  isHidden,
  isCopied,
  handleRevealPrivateKey,
  handleCopy,
  type = RevealViewType.REVEAL,
}: RevealKeyButtonsProps) => {
  const { t } = useTranslation('send');
  const router = useSendRouter();
  const isRevealPage = type === RevealViewType.REVEAL;
  const RejectActiveRpc = isRevealPage ? useRejectActiveRpcRequest : useApiWalletRejectActiveRpcRequest;
  const RpcPayloadService = isRevealPage ? AtomicRpcPayloadService : ApiWalletAtomicRpcPayloadService;
  const rejectActiveRpcRequest = RejectActiveRpc();
  const activeRpcPayload = RpcPayloadService.getActiveRpcPayload();
  const isLegacyFlow = !!activeRpcPayload?.params[0]?.isLegacyFlow;
  const isMwsFlow = !!activeRpcPayload?.params[0]?.isMWS;
  const revealIcon = isHidden ? <IcoEyeOpened /> : <IcoEyeClosed />;
  const revealLabel = isHidden ? t('Reveal') : t('Hide');
  const copyLabel = isCopied ? t('Copied') : t('Copy');
  const closeLabel = isLegacyFlow ? t('Log Out') : t('Close');

  const handleLogoutOrClose = () => {
    if (isLegacyFlow) {
      if (isMwsFlow) {
        router.replace(MWS_FLOW_ROUTE[type]);
      } else {
        router.replace(LEGACY_FLOW_ROUTE[type]);
      }
    } else {
      rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
        closedByUser: true,
      });
    }
  };

  return (
    <VStack w="full" mt={2.5} gap={5}>
      <HStack w="full" gap={3.5}>
        <Button
          expand
          size="sm"
          variant="neutral"
          label={revealLabel}
          aria-label="reveal"
          onPress={handleRevealPrivateKey}
        >
          <Button.LeadingIcon>{revealIcon}</Button.LeadingIcon>
        </Button>
        <Button expand size="sm" variant="neutral" label={copyLabel} onPress={handleCopy}>
          <Button.LeadingIcon>
            <IcoCopy />
          </Button.LeadingIcon>
        </Button>
      </HStack>
      <Button expand label={closeLabel} onPress={handleLogoutOrClose} />
    </VStack>
  );
};

export default RevealKeyButtons;
