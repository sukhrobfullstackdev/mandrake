export type GetCredentialsQueryKey = ReturnType<typeof cognitoIdentityQueryKeys.getCredentials>;

export type GetCredentialsParams = {
  delegatedIdentityId: string;
  delegatedAccessToken: string;
  systemClockOffset: number;
};

export const cognitoIdentityQueryKeys = {
  base: ['cognito-cache'] as const,

  getCredentials: (params: GetCredentialsParams) =>
    [[...cognitoIdentityQueryKeys.base, 'get-credentials'], params] as const,
};
