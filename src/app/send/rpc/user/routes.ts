import { ValidRoutesConfig } from '@app/send/rpc/routes';

export const userRoutes: ValidRoutesConfig = {
  // User module routes
  magic_auth_settings: { module: 'user' },
  magic_user_update_webauthn: { module: 'user' },
  magic_user_unregister_webauthn: { module: 'user' },
  magic_user_get_webauthn_credentials: { module: 'user' },
  magic_get_info: { module: 'user' },
  magic_auth_get_metadata: { module: 'user', pathOverride: 'magic_get_info' },
  magic_reveal_key: { module: 'user' },
  reveal_page_login: { module: 'user' },
};
