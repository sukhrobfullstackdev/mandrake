/* istanbul ignore file */
import { useStore } from '@hooks/store';
import { type LDFlagSet } from '@launchdarkly/node-server-sdk';

/**
 * Instantiate auth relayer and communicates native dApp Frame and auth
 */
export abstract class MessageRelayer {
  protected signalReady!: () => void;

  constructor(
    protected encodedQueryParams: string,
    protected flags?: LDFlagSet,
    protected accessAllowlists?: string[],
  ) {
    /* Add central event listener for both directions */
    this.addMessageListener();
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

  abstract messageHandler(evt: MessageEvent): void;

  protected abstract postMessage(messageData: unknown): void;
}
