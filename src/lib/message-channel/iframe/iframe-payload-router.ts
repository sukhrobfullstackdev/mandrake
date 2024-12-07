import { validRoutes } from '@app/send/rpc/routes';
import { ETH_SEND_GASLESS_TRANSACTION, ETH_SENDTRANSACTION, ETH_SIGNTRANSACTION } from '@constants/eth-rpc-methods';
import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { LEGACY_RELAYER_DOM_ELEMENT_ID } from '@constants/legacy-relayer';
import { MAGIC_INTERMEDIARY_EVENT } from '@constants/route-methods';
import { MagicMethodEventData } from '@custom-types/rpc';
import { useStore } from '@hooks/store';
import { LDFlagSet } from '@launchdarkly/node-server-sdk';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { getBaseAnalyticsProperties } from '@lib/message-channel/event-helper';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { PayloadRouter } from '@lib/message-channel/router';
import { checkAllowlist } from '@lib/utils/assert-url';
import { MagicPayloadMethod, UiEventsEmit } from '@magic-sdk/types';
import { genericEthProxy } from '@message-channel/eth-proxy-for-headless';
import { resolveJsonRpcResponse } from '@message-channel/resolve-json-rpc-response';
import { sdkReject } from '@message-channel/sdk-reject';
import { snakeToCamelCase } from '@utils/string-utils';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export class IframePayloadRouter extends PayloadRouter {
  constructor(
    router: AppRouterInstance,
    flags?: LDFlagSet,
    protected isGlobalAppScope: boolean = false,
  ) {
    super(router, flags);
  }

  route(messageData: MagicMethodEventData) {
    const method = messageData?.payload?.method;

    // For unrecognized payload, return
    if (!method) {
      return;
    }

    const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

    // Handle MagicIntermediaryEvents in Mandrake
    if (method === MAGIC_INTERMEDIARY_EVENT) {
      // The payload ID check ensures that the payload has been processed by Mandrake's AtomicRpcPayloadService,
      // and verifies that the payload route exists in Mandrake.
      // This guarantees that subsequent intermediary events will be processed within the same project.
      if (
        activeRpcPayload?.id === messageData?.payload?.params[0]?.payloadId ||
        messageData?.payload?.params[0]?.eventType === UiEventsEmit.CloseMagicWindow
      ) {
        return this.routeIntermediaryEvent(messageData);
      }

      // Putting a check here to avoid unhandled events passing thru the check and reject the next payload by accident
      if (!activeRpcPayload && !this.isGlobalAppScope) {
        logger.warn('Unhandled Dedicated Wallet intermediary event', messageData.payload);
        return;
      }
    }

    // routeUniversalTrafficToMandrake is API key-based, and only turned on for Forbes for these two methods
    if (this.flags?.routeUniversalTrafficToMandrake) {
      return this.routeForbesPayload(messageData);
    }

    /**
     *  Global App routes to Phantom
     */
    if (this.isGlobalAppScope) {
      return this.routeToPhantom(messageData);
    }

    /**
     *  From here it's All Scoped App
     */
    const config = validRoutes[method];
    const isRpcMethodEnabled = this.flags?.[snakeToCamelCase(`rpc_route_${method.toLowerCase()}_enabled`)];
    const isRpcModuleEnabled =
      config?.module && this.flags?.[snakeToCamelCase(`rpc_routes_${config?.module}_module_enabled`)];
    const isValidMandrakeRoute = config && (isRpcMethodEnabled || isRpcModuleEnabled);
    if (isValidMandrakeRoute) {
      return this.digestInMandrake(messageData);
    }

    // eth proxy
    if (
      this.flags?.shouldUseEthProxy &&
      (method.startsWith('eth_') || method.startsWith('net_')) &&
      method !== ETH_SENDTRANSACTION &&
      method !== ETH_SIGNTRANSACTION &&
      method !== ETH_SEND_GASLESS_TRANSACTION
    ) {
      return this.handleWithEthProxy(messageData);
    }

    // Phantom handles everything else
    if (!this.flags?.shouldSkipPhantom) {
      return this.routeToPhantom(messageData);
    }

    // If the method is not processed, reject the request
    logger.error('Phantom has been disabled, but a request was sent to Phantom. Rejecting request.');
    sdkReject(messageData.payload, RpcErrorCode.InternalError, RpcErrorMessage.FeatureToggledMisConfigured, {
      payload: { payload: messageData.payload, activeRPC: activeRpcPayload },
    });
    return;
  }

  routeIntermediaryEvent(messageData: MagicMethodEventData) {
    logger.info('Routed intermediary event', messageData.payload);
    AtomicRpcPayloadService.handleRequestEvent(messageData?.payload?.params[0]);
  }

  routeForbesPayload(messageData: MagicMethodEventData) {
    const method = messageData?.payload?.method;
    if (method === MagicPayloadMethod.Login || method === MagicPayloadMethod.NFTCheckout) {
      this.digestInMandrake(messageData);
    } else {
      this.routeToPhantom(messageData);
    }
  }

  digestInMandrake(messageData: MagicMethodEventData) {
    const method = messageData?.payload?.method;
    const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
    // Scoped Apps + Forbes
    if (activeRpcPayload) {
      return AtomicRpcPayloadService.enqueuePendingRpcRequest(messageData.payload);
    }
    AtomicRpcPayloadService.setActiveRpcPayload(messageData.payload);
    // checkAllowlist cheecks whether domain is allowed or not.
    const isPassedCheck = checkAllowlist(
      messageData.clientAppOrigin,
      messageData?.payload,
      messageData?.accessAllowlists,
    );
    if (!isPassedCheck) {
      const errorPageUrl = new URL('/send/error/unauthorized_domain_error', window.location.origin);
      errorPageUrl.searchParams.set('origin', messageData.clientAppOrigin);
      this.router.replace(errorPageUrl.href);
      logger.error('Unauthorized Domain is triggerred', {
        origin: messageData.clientAppOrigin,
        accessAllowlist: messageData?.accessAllowlists,
      });
      IFrameMessageService.showOverlay();
      return;
    }
    useStore.setState({
      isGlobalAppScope: this.isGlobalAppScope,
      sdkMetaData: {
        webCryptoDpopJwt: messageData.jwt,
        userSessionRefreshToken: messageData.rt,
        deviceShare: messageData.deviceShare,
      },
    });
    const path = AtomicRpcPayloadService.constructRpcPath(messageData.jwt);
    logger.info(`Routing rpc request method: ${method} payloadData: ${JSON.stringify(messageData.payload)}`);
    AtomicRpcPayloadService.startPerformanceTimer(method);
    this.router.replace(path);
    return;
  }

  private async handleWithEthProxy(messageData: MagicMethodEventData) {
    // eth_sendTransaction and eth_sign should be handled above by the Mandrake
    const { sdkMetaData, decodedQueryParams } = useStore.getState();
    const analyticsProperties = getBaseAnalyticsProperties();
    try {
      const { result, error } = await genericEthProxy(messageData.payload, decodedQueryParams.ethNetwork);
      if (!error) {
        // Don't check result, as it can be null
        resolveJsonRpcResponse({
          payload: messageData.payload,
          sdkMetadata: sdkMetaData || {},
          analyticsProperties,
          result,
        });
      } else {
        sdkReject(messageData.payload, error.code, error.message, error.data, analyticsProperties);
      }
    } catch (e) {
      const error = e as Error;
      sdkReject(messageData.payload, RpcErrorCode.InternalError, error.message, error, analyticsProperties);
    }
  }

  private routeToPhantom(messageData: MagicMethodEventData) {
    const legacyIframe = document.getElementById(LEGACY_RELAYER_DOM_ELEMENT_ID);
    (legacyIframe as HTMLIFrameElement)?.contentWindow?.postMessage(messageData, '*');
  }
}
