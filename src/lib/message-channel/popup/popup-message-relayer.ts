import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { MessageRelayer } from '@lib/message-channel/message-relayer';
import { PopupMessageService } from '@lib/message-channel/popup/popup-message-service';
import { PopupPayloadRouter } from '@lib/message-channel/popup/popup-payload-router';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Instantiate Popup Message Relayer
 */
export class PopupMessageRelayer extends MessageRelayer {
  private ready: Promise<boolean> = new Promise(resolve => {
    this.signalReady = () => {
      resolve(true);
    };
  });

  protected messageEventListenerAdded = false;

  protected payloadRouter: PopupPayloadRouter;

  constructor(router: AppRouterInstance, encodedQueryParams: string) {
    // add message event listener
    super(encodedQueryParams);

    this.payloadRouter = new PopupPayloadRouter(router);

    PopupMessageService.overlayGreenlight();
    this.signalReady();
  }

  public addMessageListener() {
    if (!this.messageEventListenerAdded) {
      try {
        window.addEventListener('message', (evt: MessageEvent) => {
          PopupAtomicRpcPayloadService.setEventOrigin(evt.origin);
          this.messageHandler(evt);
        });

        this.messageEventListenerAdded = true;
      } catch (err) {
        logger.error('error adding message event listener', err ?? {});
      }
    }
  }

  public async messageHandler(evt: MessageEvent) {
    try {
      const messageData = evt.data;
      this.postMessage(messageData);

      await this.ready;

      this.payloadRouter.route(messageData);
    } catch (err) {
      logger.error('error executing message event handler', err ?? {});
    }
  }

  protected postMessage(messageData: unknown) {
    return window.opener.postMessage(messageData, '*');
  }
}
