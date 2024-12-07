import { validRoutes } from '@app/passport/rpc/routes';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { MAGIC_INTERMEDIARY_EVENT } from '@constants/route-methods';
import { MagicMethodEventData } from '@custom-types/rpc';
import { rejectPopupRequest } from '@hooks/common/popup/popup-json-rpc-request';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { PayloadRouter } from '@lib/message-channel/router';

export class PopupPayloadRouter extends PayloadRouter {
  route(messageData: MagicMethodEventData) {
    const method = messageData?.payload?.method;

    // For unrecognized payload, return
    if (!method) {
      return;
    }

    const activeRpcPayload = PopupAtomicRpcPayloadService.getActiveRpcPayload();

    // Handle MagicIntermediaryEvents
    if (method === MAGIC_INTERMEDIARY_EVENT && activeRpcPayload?.id === messageData?.payload?.params[0]?.payloadId) {
      return this.routeIntermediaryEvent(messageData);
    }

    const config = validRoutes[method];
    if (config) {
      return this.handleRoute(messageData);
    }
    return;
  }

  routeIntermediaryEvent(messageData: MagicMethodEventData) {
    PopupAtomicRpcPayloadService.handleRequestEvent(messageData?.payload?.params[0]);
  }

  handleRoute(messageData: MagicMethodEventData) {
    const method = messageData?.payload?.method;
    const activeRpcPayload = PopupAtomicRpcPayloadService.getActiveRpcPayload();
    if (activeRpcPayload) {
      // if there is an active request, reject it and override
      rejectPopupRequest(RpcErrorCode.PopupRequestOverriden, RpcErrorMessage.PopupRequestOverriden, undefined, false);
    }
    PopupAtomicRpcPayloadService.setActiveRpcPayload(messageData.payload);
    const path = PopupAtomicRpcPayloadService.constructRpcPath();

    logger.info(`Routing rpc request method: ${method} payloadData: ${JSON.stringify(messageData.payload)}`);
    this.router.replace(path);
  }
}
