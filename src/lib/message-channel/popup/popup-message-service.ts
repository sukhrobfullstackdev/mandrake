import { popupPostMessage } from '@lib/message-channel/popup/popup-post-message';
import { MagicIncomingWindowMessage } from 'magic-passport/types';

export const PopupMessageService = {
  overlayGreenlight: () => {
    popupPostMessage(MagicIncomingWindowMessage.MAGIC_POPUP_READY);
  },
};
