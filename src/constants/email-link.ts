export enum EmailLinkConfirmErrorState {
  LinkBroken = 'link-broken',
  RedirectFailed = 'redirect-failed',
  MismatchedIP = 'mismatched-ip',
  AuthExpired = 'auth-expired',
  InternalError = 'internal-error',
  SecurityCodeExpired = 'security-code-expired',
}
