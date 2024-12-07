import { PopupMessageData, PopupMessageMethod, PopupMessageType } from '@custom-types/popup';

type OpenPopupGetResponseParams = {
  url: string;
  method: PopupMessageMethod;
};

type PostPopupMessageParams<TData> = {
  msgType?: PopupMessageType;
  method: PopupMessageMethod;
  payload: TData;
};

export const openPopup = (url: string): Window | null => {
  return window.open(url, '_blank', 'popup=true');
};

export const openPopupGetResponse = <TData>({
  url,
  method,
}: OpenPopupGetResponseParams): Promise<PopupMessageData<TData>> => {
  return new Promise((resolve, reject) => {
    const popupWindow = openPopup(url);
    let hasResolved = false;

    // checking for if popup was closed, but not resolved
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      if (popupWindow?.closed && !hasResolved) {
        clearInterval(timer);
        reject(new Error('Popup was closed without returning data.'));
      }
    }, 2000);

    const handleMessage = (event: MessageEvent) => {
      // if method or origin is not the same as the expected, exit
      if (event.origin !== window.origin) return;
      if (event.data?.method !== method) return;

      hasResolved = true;

      if (!event.data?.payload) {
        if (timer) clearInterval(timer);
        reject(new Error('Popup window returned no data.'));
      }

      if (event.data?.payload?.error) {
        if (timer) clearInterval(timer);
        reject(new Error(event.data.payload.error));
      }

      if (timer) clearInterval(timer);
      resolve(event.data as PopupMessageData<TData>);
    };

    window.addEventListener('message', handleMessage);
  });
};

export const postPopupMessage = <TData>({
  payload,
  method,
  msgType = PopupMessageType.MAGIC_POPUP_RESPONSE,
}: PostPopupMessageParams<TData>) => {
  if (window.opener) {
    const message: PopupMessageData<TData> = {
      msgType,
      method,
      payload,
    };

    window.opener?.postMessage(message, '*');
  } else {
    throw new Error('No window.opener found to send message to.');
  }
};
