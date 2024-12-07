import { useStore } from '@hooks/store';
import { IFrameMessageRelayer } from '@lib/message-channel/iframe/iframe-message-relayer';
import { waitFor } from '@testing-library/react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

describe('@lib/message-channel/iframe/iframe-message-relayer', () => {
  const onIframeSpy = jest.fn();
  const onMessageSpy = jest.fn();

  const router = jest.fn().mockResolvedValue({
    push: jest.fn(),
    forward: jest.fn(),
  }) as unknown as AppRouterInstance;

  beforeAll(() => {
    window.addEventListener('message', (evt: MessageEvent) => onMessageSpy(evt.data.msgType));
    const config = { attributes: true, childList: true, subtree: true };
    const observer = new MutationObserver(onIframeSpy);
    observer.observe(document, config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not instantiate a message relayer if messageEventListenerAdded is true', () => {
    useStore.setState({ messageEventListenerAdded: true });

    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    new IFrameMessageRelayer(router, 'encodedQueryParams', jest.fn());

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should trigger message relayer toggle', async () => {
    await new IFrameMessageRelayer(router, 'encodedQueryParams', jest.fn());

    window.parent.postMessage({ msgType: 'MAGIC_SHOW_OVERLAY' }, '*');

    await waitFor(() => {
      expect(onMessageSpy).toHaveBeenCalledWith('MAGIC_SHOW_OVERLAY');
    });
  });
});
