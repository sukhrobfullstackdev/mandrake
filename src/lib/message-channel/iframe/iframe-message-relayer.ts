import { Client } from '@constants/endpoint';
import { LEGACY_URL } from '@constants/env';
import { LEGACY_RELAYER_DOM_ELEMENT_ID } from '@constants/legacy-relayer';
import { SecretManagementStrategy } from '@constants/wallet-secret-management';
import { MagicSdkIncomingWindowMessage, MagicSdkOutgoingWindowMessage } from '@constants/window-messages';
import { MagicMethodEventData } from '@custom-types/rpc';
import { useStore } from '@hooks/store';
import { type LDFlagSet } from '@launchdarkly/node-server-sdk';
import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { IframePayloadRouter } from '@lib/message-channel/iframe/iframe-payload-router';
import { MessageRelayer } from '@lib/message-channel/message-relayer';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Instantiate auth relayer and communicates native dApp Frame and auth
 */
export class IFrameMessageRelayer extends MessageRelayer {
  private isGlobalAppScope: boolean = false;

  private secretMgmtStrategy: SecretManagementStrategy.DKMSV3 | SecretManagementStrategy.SHAMIRS_SECRET_SHARING =
    SecretManagementStrategy.DKMSV3;

  private ready: Promise<boolean>;

  protected payloadRouter: IframePayloadRouter;

  constructor(
    private readonly router: AppRouterInstance,
    encodedQueryParams: string,
    flags?: LDFlagSet,
    accessAllowlists?: string[],
  ) {
    super(encodedQueryParams, flags, accessAllowlists);
    this.payloadRouter = new IframePayloadRouter(router, flags, this.isGlobalAppScope);
    /* One-Time client side redirect to Legacy Relayer */
    const legacyIframe = document.getElementById(LEGACY_RELAYER_DOM_ELEMENT_ID) as HTMLIFrameElement;

    this.ready = new Promise(resolve => {
      this.signalReady = () => {
        this.handleVersionSkewRecovery();
        resolve(true);
      };
    });

    /**
     * Phase out Phantom plan:
     *
     * Forbes -> Mandrake initializes Phantom, NFT payloads are sent to Mandrake; all other traffic is directed to Phantom.
     * Dedicated, e.g. IMX -> All traffic is directed to Mandrake; Phantom will not be initialized.
     * Universal & key sharing payloads -> Mandrake initializes Phantom; all traffic is directed to Phantom.
     *
     * The ShouldSkipPhantom flag is set for Dedicated Apps to gradually phase out Phantom.
     */
    if ((this.isGlobalAppScope || !this.flags?.shouldSkipPhantom) && legacyIframe?.src === 'about:blank') {
      legacyIframe.src = new URL(`${Client.SendLegacy}?params=${this.encodedQueryParams}`, LEGACY_URL).href;
    }

    if (this.flags?.shouldSkipPhantom) {
      IFrameMessageService.overlayGreenlight();
      this.signalReady(); // Mandrake signals ready when Phantom is not initialized
    }
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

  public setAppRoutingConfig(
    isGlobalAppScope: boolean,
    walletSecretManagementStrategy: SecretManagementStrategy.DKMSV3 | SecretManagementStrategy.SHAMIRS_SECRET_SHARING,
  ) {
    this.isGlobalAppScope = isGlobalAppScope;
    this.secretMgmtStrategy = walletSecretManagementStrategy;
    this.payloadRouter = new IframePayloadRouter(this.router, this.flags, this.isGlobalAppScope);
  }

  public async messageHandler(evt: MessageEvent) {
    try {
      const messageData = evt.data;
      const isMsgType = (msgType: string) => messageData?.msgType?.includes(msgType);
      const loginWithEmailOtpTypes = ['verify-email-otp', 'lost-device', 'verify-recovery-code'];
      if (
        messageData?.payload?.method === 'magic_intermediary_event' &&
        loginWithEmailOtpTypes.includes(messageData?.payload?.params[0]?.eventType)
      ) {
        logger.log('Received message from parent:', messageData);
      }
      if (isMsgType(MagicSdkOutgoingWindowMessage.MAGIC_PING)) {
        return this.postMessage({ msgType: MagicSdkIncomingWindowMessage.MAGIC_PONG });
      }

      const isPhantomMessage = LEGACY_URL.includes(evt.origin);

      /**
       * Handler for message from Auth.
       * Also filter messages that doesn't belong to this auth relayer.
       * [Phantom] -> [Mandrake (Here)] -> [DApp Frame]
       */
      if (isPhantomMessage) {
        if (isMsgType(MagicSdkIncomingWindowMessage.MAGIC_OVERLAY_READY)) {
          logger.info('Signaling overlay ready to SDK');
          this.signalReady();
        } else if (isMsgType(MagicSdkIncomingWindowMessage.MAGIC_SHOW_OVERLAY)) {
          this.showOverlay();
        } else if (isMsgType(MagicSdkIncomingWindowMessage.MAGIC_HIDE_OVERLAY)) {
          this.hideOverlay();
        }

        this.postMessage(messageData);
      } else {
        // If its not from the auth frame, pass it through to the auth frame.
        // this means its an sdk request.
        // connect the check to LD.
        const messageDataCopy: MagicMethodEventData = {
          ...messageData,
          clientAppOrigin: evt.origin,
          accessAllowlists: this.accessAllowlists,
        };

        await this.ready;
        this.payloadRouter.route(messageDataCopy);
      }
    } catch (err) {
      logger.error('error executing message event handler', err ?? {});
    }
  }

  private showOverlay() {
    const legacyIframe = document.getElementById(LEGACY_RELAYER_DOM_ELEMENT_ID);
    if (legacyIframe) {
      legacyIframe.style.display = 'block';
    }
  }

  private hideOverlay() {
    const legacyIframe = document.getElementById(LEGACY_RELAYER_DOM_ELEMENT_ID);
    if (legacyIframe) {
      legacyIframe.style.display = 'none';
    }
  }

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
