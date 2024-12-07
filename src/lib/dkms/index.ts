import { reconstructSecretWithUserSession } from '@lib/dkms/reconstruct-secret-with-user-session';
import { reconstructSecret } from '@lib/dkms/reconstruct-secret';
import { syncWallet } from '@lib/dkms/sync-wallet';

export const DkmsService = {
  reconstructSecret,
  syncWallet,
  reconstructSecretWithUserSession,
};
