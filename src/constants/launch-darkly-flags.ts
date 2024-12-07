import { type LDFlagSet } from '@launchdarkly/node-server-sdk';

// Default values in case there's an error initializing LD
export const flagDefaults: LDFlagSet = {
  test: false,
  testFlag: false,
  rpcRouteMagicAuthLoginWithEmailOtp: false,
};
