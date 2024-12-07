import { MagicMethodEventData } from '@custom-types/rpc';
import { useStore } from '@hooks/store';
import { type LDFlagSet } from '@launchdarkly/node-server-sdk';
import { IFrameMessageService } from '@lib/message-channel/iframe-api-wallets/iframe-message-service';
import { IframePayloadRouter } from '@lib/message-channel/iframe-api-wallets/iframe-payload-router';
import { MessageRelayer } from '@lib/message-channel/message-relayer';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Instantiate auth relayer and communicates native dApp Frame and auth
 */
export class IFrameMessageRelayer extends MessageRelayer {
  private isGlobalAppScope = false;

  private ready: Promise<boolean>;

  protected payloadRouter: IframePayloadRouter;

  constructor(
    private readonly router: AppRouterInstance,
    encodedQueryParams: string,
    flags?: LDFlagSet,
  ) {
    super(encodedQueryParams, flags);

    this.payloadRouter = new IframePayloadRouter(router, flags, this.isGlobalAppScope);

    this.ready = new Promise(resolve => {
      this.signalReady = () => {
        this.handleVersionSkewRecovery();
        resolve(true);
      };
    });

    IFrameMessageService.overlayGreenlight();

    this.signalReady(); // Mandrake signals ready when Phantom is not initialized
  }

  public addMessageListener() {
    const { messageEventListenerAdded } = useStore.getState();

    if (!messageEventListenerAdded) {
      try {
        window.addEventListener('message', (evt: MessageEvent) => this.messageHandler(evt));
        useStore.setState({ messageEventListenerAdded: true });
      } catch (err) {
        logger.error('error adding message event listener', err ?? {});
      }
    }
  }

  public setFlags(flags: LDFlagSet) {
    this.flags = flags;
  }

  public setAppRoutingConfig(isGlobalAppScope: boolean) {
    this.isGlobalAppScope = isGlobalAppScope;
    this.payloadRouter = new IframePayloadRouter(this.router, this.flags, this.isGlobalAppScope);
  }

  public async messageHandler(evt: MessageEvent) {
    try {
      const messageData = evt.data;

      // If its not from the auth frame, pass it through to the auth frame.
      // this means its an sdk request.
      // connect the check to LD.
      const messageDataCopy: MagicMethodEventData = {
        ...messageData,
        clientAppOrigin: evt.origin,
      };

      await this.ready;
      this.payloadRouter.route(messageDataCopy);
    } catch (err) {
      logger.error('error executing message event handler', err ?? {});
    }
  }

  // skipcq: JS-0105
  protected postMessage(messageData: unknown) {
    return window.parent.postMessage(messageData, '*');
  }

  protected handleVersionSkewRecovery() {
    const activeRpcPayloadStr = localStorage.getItem('activeRpcPayload');
    if (!localStorage.getItem('isReloaded') || !activeRpcPayloadStr) return;

    localStorage.removeItem('isReloaded');
    localStorage.removeItem('activeRpcPayload');

    const payload = JSON.parse(activeRpcPayloadStr);
    logger.info(`Recovered from version skew, re-routing rpc payload ${activeRpcPayloadStr}.`);

    this.payloadRouter.route({ payload });
  }
}
