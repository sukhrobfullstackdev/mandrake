export type DeviceVerificationPollerQueryKey = ReturnType<typeof deviceVerificationQueryKeys.status>;

export type DeviceVerificationPollerParams = {
  verifyLink: string;
};

export const deviceVerificationQueryKeys = {
  base: ['device-verification'] as const,

  status: (params: DeviceVerificationPollerParams) =>
    [[...deviceVerificationQueryKeys.base, 'status'], params] as const,
};
