import { IFrameMessageService } from '@lib/message-channel/iframe/iframe-message-service';
import { waitFor } from '@testing-library/react';

describe('@lib/window-message-service', () => {
  const onMessageSpy = jest.fn();

  beforeAll(() => {
    window.addEventListener('message', (evt: MessageEvent) => onMessageSpy(evt.data.msgType));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('posts a ready message to the window parent', async () => {
    IFrameMessageService.overlayGreenlight();

    await waitFor(() => expect(onMessageSpy).toHaveBeenCalledWith('MAGIC_OVERLAY_READY'));
  });

  it('posts a show message to the window parent', async () => {
    await IFrameMessageService.showOverlay();

    await waitFor(() => expect(onMessageSpy).toHaveBeenCalledWith('MAGIC_SHOW_OVERLAY'));
  });

  it('posts a hide message to the window parent', async () => {
    await IFrameMessageService.hideOverlay();

    await waitFor(() => expect(onMessageSpy).toHaveBeenCalledWith('MAGIC_HIDE_OVERLAY'));
  });
});
