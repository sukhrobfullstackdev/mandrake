import { UnknownArray, UnknownRecord } from 'type-fest';

export enum PopupMessageType {
  MAGIC_POPUP_READY = 'MAGIC_POPUP_READY',
  MAGIC_POPUP_REQUEST = 'MAGIC_POPUP_REQUEST',
  MAGIC_POPUP_RESPONSE = 'MAGIC_POPUP_RESPONSE',
}

export enum PopupMessageMethod {
  MAGIC_POPUP_OAUTH_VERIFY_RESPONSE = 'magic_popup_oauth_verify_response',
}

export interface PopupMessageData<T = UnknownArray | UnknownRecord | unknown> {
  msgType: PopupMessageType;
  method: PopupMessageMethod;
  payload: T;
}
