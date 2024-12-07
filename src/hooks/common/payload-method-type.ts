import { JsonRpcRequestPayload, MagicPayloadMethod } from '@magic-sdk/types';

export const isUIAuthMethodPayload = (payload?: JsonRpcRequestPayload | null) => {
  if (!payload) {
    return false;
  }
  const authFlowList = [
    MagicPayloadMethod.LoginWithEmailOTP,
    MagicPayloadMethod.LoginWithMagicLink,
    MagicPayloadMethod.LoginWithSms,
    MagicPayloadMethod.Login,
  ];
  return authFlowList.includes(payload.method as MagicPayloadMethod);
};
