import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useChainInfo } from '@hooks/common/chain-info';
import { useRejectActiveRpcRequest, useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { Button, Header, IcoArrowLeft, IcoDismiss, IcoUsers, IcoWallet, Page, Text } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';
import { useMemo } from 'react';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { METHODS_TO_RESOLVE_WITH_TRUE } from '@constants/route-methods';

interface WalletPageHeaderProps {
  onPressBack?: () => void;
  onPressClose?: () => void;
  isHomePage?: boolean;
  isAccountPage?: boolean;
}

const WalletPageHeader = ({ onPressBack, onPressClose, isHomePage, isAccountPage }: WalletPageHeaderProps) => {
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();

  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const { chainInfo } = useChainInfo();

  const handleClose = () => {
    AtomicRpcPayloadService.emitJsonRpcEventResponse('done');
    if (METHODS_TO_RESOLVE_WITH_TRUE.includes(activeRpcPayload?.method as string)) {
      return resolveActiveRpcRequest(true);
    }
    rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.UserCanceledAction, undefined, {
      closedByUser: true,
    });
  };

  const backButton = useMemo(() => {
    if (!onPressBack) return null;

    const variant = isAccountPage ? 'transparent' : 'neutral';
    const label = isAccountPage ? 'navigate wallet page' : `navigate ${isHomePage ? 'account page' : 'back'}`;
    const icon = isAccountPage ? <IcoWallet /> : isHomePage ? <IcoUsers /> : <IcoArrowLeft />;
    const key = isAccountPage ? 'transparent-left-button' : 'neutral-left-button';

    return (
      <Button variant={variant} size="sm" onPress={onPressBack} aria-label={label} key={key}>
        <Button.LeadingIcon>{icon}</Button.LeadingIcon>
      </Button>
    );
  }, [isHomePage, isAccountPage, onPressBack]);

  return (
    <Page.Header>
      {!!onPressBack && <Header.LeftAction>{backButton}</Header.LeftAction>}

      <Header.Content>
        <Text size="sm" styles={{ color: token(isAccountPage ? 'colors.ink.30' : 'colors.text.tertiary') }}>
          {chainInfo?.networkName}
        </Text>
      </Header.Content>

      <Header.RightAction>
        <Button
          variant={isAccountPage ? 'transparent' : 'neutral'}
          key={isAccountPage ? 'transparent-right-button' : 'neutral-right-button'}
          size="sm"
          onPress={onPressClose ? onPressClose : handleClose}
          aria-label="close"
        >
          <Button.TrailingIcon>
            <IcoDismiss />
          </Button.TrailingIcon>
        </Button>
      </Header.RightAction>
    </Page.Header>
  );
};

export default WalletPageHeader;
