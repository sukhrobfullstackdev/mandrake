import { MagicSdkIncomingWindowMessage } from '@constants/window-messages';
import { iFramePostMessage } from '@lib/message-channel/iframe-api-wallets/iframe-post-message';

export const IFrameMessageService = {
  overlayGreenlight: () => {
    iFramePostMessage(MagicSdkIncomingWindowMessage.MAGIC_OVERLAY_READY);
  },
  showOverlay: () => {
    iFramePostMessage(MagicSdkIncomingWindowMessage.MAGIC_SHOW_OVERLAY);
  },
  hideOverlay: () => {
    iFramePostMessage(MagicSdkIncomingWindowMessage.MAGIC_HIDE_OVERLAY);
  },
};
