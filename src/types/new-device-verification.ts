export enum DeviceVerificationStatus {
  NotStarted = 'not-started',
  Approved = 'approved',
  Expired = 'expired',
  NeedsFurtherApproval = 'needs-further-approval',
  Rejected = 'rejected',
}

interface DeviceMetadata {
  deviceId: string;
  origin: string;
  browser: string;
  os: string;
  uaSig: string;
  email: string;
  deviceIp?: string;
}

export type ParsedDeviceVerificationQueryParams = {
  ak: string;
  ct: string;
  locale: string;
  token: string;
};

export type DeviceVerifyingTokenPayload = {
  aud: string;
  zap: string;
  exp: number; // expiry timestamp
  iat: number; // issued timestamp
  iss: string;
  jti: string;
  scope: string;
  sub: string; // device profile id
  style?: unknown; // RawThemeConfig;
  metadata: DeviceMetadata;
};
