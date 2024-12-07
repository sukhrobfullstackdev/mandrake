import { MagicSdkIncomingWindowMessage } from '@constants/window-messages';
import { iFramePostMessage } from '@lib/message-channel/iframe/iframe-post-message';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';

export const IFrameMessageService = {
  overlayGreenlight: () => {
    iFramePostMessage(MagicSdkIncomingWindowMessage.MAGIC_OVERLAY_READY);
  },
  showOverlay: () => {
    AtomicRpcPayloadService.setIsUIFlow(true);
    iFramePostMessage(MagicSdkIncomingWindowMessage.MAGIC_SHOW_OVERLAY);
  },
  hideOverlay: () => {
    iFramePostMessage(MagicSdkIncomingWindowMessage.MAGIC_HIDE_OVERLAY);
  },
};
