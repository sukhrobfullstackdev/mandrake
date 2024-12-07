import { getParsedQueryParams } from '@utils/query-string';
import {
  DeviceVerifyingTokenPayload,
  ParsedDeviceVerificationQueryParams,
} from '@custom-types/new-device-verification';
import { camelizeKeys } from '@utils/object-helpers';
import { parseJWT } from '@utils/base64';

export const marshallDeviceVerificationQueryParams = (searchParams: string) => {
  const { ak, locale, token: deviceToken } = getParsedQueryParams(searchParams) as ParsedDeviceVerificationQueryParams;

  const {
    exp: expiryTimestamp, // expiry timestamp
    metadata,
    style, // raw custom theme configs
    sub: deviceProfileId, // device profile id
  } = camelizeKeys(parseJWT(deviceToken).payload as DeviceVerifyingTokenPayload);

  return {
    deviceToken,
    expiryTimestamp,
    metadata,
    deviceProfileId,
    ak,
    locale,
    style,
  };
};
