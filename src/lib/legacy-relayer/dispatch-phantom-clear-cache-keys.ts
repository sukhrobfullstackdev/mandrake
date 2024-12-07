import { LEGACY_RELAYER_DOM_ELEMENT_ID } from '@constants/legacy-relayer';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';

export function dispatchPhantomClearCacheKeys() {
  const { decodedQueryParams } = useStore.getState();
  const messageData = {
    clientAppOrigin: decodedQueryParams.domainOrigin,
    msgType: `MAGIC_HANDLE_REQUEST-${AtomicRpcPayloadService.getEncodedQueryParams()}`,
    payload: { method: 'clear_keys_and_cache', params: [], jsonrpc: '2.0', id: 888 },
  };
  (document.getElementById(LEGACY_RELAYER_DOM_ELEMENT_ID) as HTMLIFrameElement)?.contentWindow?.postMessage(
    messageData,
    '*',
  );
}
