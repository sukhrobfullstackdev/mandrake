import { ValidRoutesConfig } from '@app/send/rpc/routes';

export const oauthRoutes: ValidRoutesConfig = {
  magic_oauth_parse_redirect_result: { module: 'oauth' },
  magic_oauth_login_with_redirect_start: { module: 'oauth', isServerRoute: true },
  magic_oauth_login_with_redirect_verify: { module: 'oauth' },
  magic_oauth_login_with_popup: { module: 'oauth' },
};
