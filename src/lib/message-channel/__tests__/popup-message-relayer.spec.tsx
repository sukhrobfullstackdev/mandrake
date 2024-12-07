import { PopupMessageRelayer } from '@lib/message-channel/popup/popup-message-relayer';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

describe('@lib/message-channel/popup/popup-message-relayer', () => {
  const onIframeSpy = jest.fn();
  const onMessageSpy = jest.fn();

  const router = jest.fn().mockResolvedValue({
    push: jest.fn(),
    forward: jest.fn(),
  }) as unknown as AppRouterInstance;

  beforeAll(() => {
    Object.defineProperty(window, 'opener', {
      value: { postMessage: jest.fn() },
    });
    window.addEventListener('message', (evt: MessageEvent) => onMessageSpy(evt.data.msgType));
    const config = { attributes: true, childList: true, subtree: true };
    const observer = new MutationObserver(onIframeSpy);
    observer.observe(document, config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should instantiate a message relayer event listener if messageEventListenerAdded is false', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    new PopupMessageRelayer(router, 'encodedQueryParams');

    expect(addEventListenerSpy).toHaveBeenCalled();
  });
});
