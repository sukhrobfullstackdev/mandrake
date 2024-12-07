import { ApiWalletIframeAtomicPayloadService } from '@lib/message-channel/iframe-api-wallets/iframe-atomic-payload-service';
import { IframeAtomicPayloadService } from '@lib/message-channel/iframe/iframe-atomic-payload-service';
import { PayloadAtomicPayloadService } from '@lib/message-channel/popup/popup-atomic-payload-service';

export const AtomicRpcPayloadService = new IframeAtomicPayloadService();
export const PopupAtomicRpcPayloadService = new PayloadAtomicPayloadService();
export const ApiWalletAtomicRpcPayloadService = new ApiWalletIframeAtomicPayloadService();
