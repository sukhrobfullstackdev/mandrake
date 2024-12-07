export interface PassportConfig {
  id: string;
  name: string;
  logoUri: string;
  termsOfServiceUri: string;
  privacyPolicyUri: string;
  teamId: string;
}

export interface KernelClientCallData {
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
}
