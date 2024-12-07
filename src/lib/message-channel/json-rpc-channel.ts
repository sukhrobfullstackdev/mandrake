import { MagicSdkWindowMessageTypes } from '@constants/window-messages';
import { useStore } from '@hooks/store';
import { ApiWalletAtomicRpcPayloadService, AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { supportsCustomNode } from '@lib/utils/network';

/**
 * Resolves the given `msgType` with the encoded query parameters (these serve
 * as an "origin signature" to prevent duplicate `<iframe>` instances from the
 * SDK).
 */
export function resolveMessageType(msgType: MagicSdkWindowMessageTypes) {
  const { decodedQueryParams } = useStore.getState();
  const encodedQueryParams = AtomicRpcPayloadService.getEncodedQueryParams();
  const { sdkType = 'SdkMissing' } = decodedQueryParams;

  if (!supportsCustomNode(sdkType)) return msgType; // Legacy form factor omits "origin signature"

  return `${msgType}-${encodedQueryParams}`;
}

export function resolveApiWalletMessageType(msgType: MagicSdkWindowMessageTypes) {
  const encodedQueryParams = ApiWalletAtomicRpcPayloadService.getEncodedQueryParams();

  return `${msgType}-${encodedQueryParams}`;
}
