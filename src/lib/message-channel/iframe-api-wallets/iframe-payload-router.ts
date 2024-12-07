import { magicApiWalletValidRoutes } from '@app/api-wallets/rpc/routes';
import { MagicMethodEventData } from '@custom-types/rpc';
import { useStore } from '@hooks/store';
import { LDFlagSet } from '@launchdarkly/node-server-sdk';
import { ApiWalletAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { PayloadRouter } from '@lib/message-channel/router';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export class IframePayloadRouter extends PayloadRouter {
  // skipcq: JS-0128
  routeIntermediaryEvent(): void {
    throw new Error('Method not implemented.');
  }

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

    const config = magicApiWalletValidRoutes[method];
    if (config) {
      this.digestInMandrake(messageData);
    }
  }

  digestInMandrake(messageData: MagicMethodEventData) {
    const method = messageData?.payload?.method;

    ApiWalletAtomicRpcPayloadService.setActiveRpcPayload(messageData.payload);

    useStore.setState({
      isGlobalAppScope: this.isGlobalAppScope,
      sdkMetaData: {
        webCryptoDpopJwt: messageData.jwt,
        userSessionRefreshToken: messageData.rt,
        deviceShare: messageData.deviceShare,
      },
    });
    const path = ApiWalletAtomicRpcPayloadService.constructRpcPath(messageData.jwt);
    logger.info(`Routing rpc request method: ${method} payloadData: ${JSON.stringify(messageData.payload)}`);

    this.router.replace(path);
    return;
  }
}
