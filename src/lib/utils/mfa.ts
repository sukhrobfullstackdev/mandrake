import { MfaFactors } from '@custom-types/api-response';

export const mfaIsEnforced = (factorsRequired: MfaFactors): boolean => {
  return factorsRequired?.some(factor => !factor.isVerified && factor.type?.includes('totp'));
};
