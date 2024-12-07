import { ValidRoutesConfig } from '@app/send/rpc/routes';

export const gdkmsRoutes: ValidRoutesConfig = {
  magic_auth_decrypt_v1: { module: 'gdkms' },
  magic_auth_encrypt_v1: { module: 'gdkms' },
};
