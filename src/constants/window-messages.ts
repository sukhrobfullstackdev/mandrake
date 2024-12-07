import { MagicIncomingWindowMessage, MagicOutgoingWindowMessage } from '@magic-sdk/types';
import {
  MagicIncomingWindowMessage as MagicPassportIncomingWindowMessage,
  MagicOutgoingWindowMessage as MagicPassportOutgoingWindowMessage,
} from 'magic-passport/types';

enum HydrateAppConfig {
  HYDRATE_APP_CONFIG = 'HYDRATE_APP_CONFIG',
}

export const MagicSdkIncomingWindowMessage = {
  ...MagicIncomingWindowMessage,
  ...MagicPassportIncomingWindowMessage,
  ...HydrateAppConfig,
};

export const MagicSdkOutgoingWindowMessage = {
  ...MagicOutgoingWindowMessage,
};

export type MagicSdkIncomingWindowMessageType =
  | MagicIncomingWindowMessage
  | MagicPassportIncomingWindowMessage
  | HydrateAppConfig;

export type MagicSdkOutgoingWindowMessageType = MagicOutgoingWindowMessage | MagicPassportOutgoingWindowMessage;

export type MagicSdkWindowMessageTypes = MagicSdkIncomingWindowMessageType | MagicSdkOutgoingWindowMessageType;
