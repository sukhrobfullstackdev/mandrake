// Update this with your types path

import { PopupMessageData, PopupMessageMethod, PopupMessageType } from '@custom-types/popup';
import { fireEvent } from '@testing-library/react';
import { openPopupGetResponse } from '../popup';

describe('openPopupGetResponse', () => {
  const mockUrl = 'mock-url';
  const mockMethod = PopupMessageMethod.MAGIC_POPUP_OAUTH_VERIFY_RESPONSE;
  const mockOrigin = 'http://localhost';

  beforeAll(() => {
    Object.defineProperty(window, 'open', {
      value: jest.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with correct data when received', async () => {
    const mockData: PopupMessageData<string> = {
      msgType: PopupMessageType.MAGIC_POPUP_RESPONSE,
      method: mockMethod,
      payload: 'success',
    };

    const promise = openPopupGetResponse<string>({ url: mockUrl, method: mockMethod });

    fireEvent(window, new MessageEvent('message', { data: mockData, origin: mockOrigin }));

    await expect(promise).resolves.toEqual(mockData);
  });

  it('should reject with error when popup window returns no data', async () => {
    const promise = openPopupGetResponse<string>({ url: mockUrl, method: mockMethod });

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          msgType: PopupMessageType.MAGIC_POPUP_RESPONSE,
          method: mockMethod,
          payload: null,
        },
        origin: mockOrigin,
      }),
    );

    await expect(promise).rejects.toThrow('Popup window returned no data.');
  });

  it('should reject with error when popup window returns an error', async () => {
    const errorMessage = 'Error message from popup window';
    const promise = openPopupGetResponse<string>({ url: mockUrl, method: mockMethod });

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          msgType: PopupMessageType.MAGIC_POPUP_RESPONSE,
          method: mockMethod,
          payload: { error: errorMessage },
        },
        origin: mockOrigin,
      }),
    );

    await expect(promise).rejects.toThrow(errorMessage);
  });
});
