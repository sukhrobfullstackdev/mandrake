export enum Client {
  Send = '/send',
  SendLegacy = '/send-legacy',
  Confirm = '/confirm',
  Login = '/login',
  Preview = '/preview/:id',
  ConfirmAction = '/confirm-action',
  ConfirmEmail = '/confirm-email/:type',
  Error = '/error',
  NewDevice = '/v1/new-device-verification',
  NFTTransfer = '/v1/nft-transfer',
}

export enum MagicClient {
  Config = '/v2/core/magic_client/config',
  OAuthApp = '/v1/api/magic_client/oauth_app',
}

export enum Session {
  Persist = '/v1/session/persist',
  Refresh = '/v1/session/refresh',
}

export enum Wallet {
  GetWalletInfo = '/v1/core/wallet',
  SyncWallet = '/v3/auth/user/wallet/sync',
  Export = '/v1/auth/user/wallet/export',
}

export enum User {
  GetUserSessionTokenFromRefreshToken = '/v1/auth/user/session/refresh',
  VerifySession = '/v1/auth/user/session/verify',
  Logout = '/v1/auth/user/logout',
  GetUserInfo = '/v1/core/user',
}

export enum AccountRecovery {
  Factor = '/v1/auth/user/factor',
  Challenge = '/alpha/v1/factor/challenge',
  Verify = '/alpha/v1/factor/verify',
  EmailUpdateChallenge = '/v1/auth/user/email/update/challenge',
  EmailUpdateVerify = '/v1/auth/user/email/update/verify',

  RecoveryChallenge = '/v1/auth/user/recovery/challenge',
  RecoveryVerify = '/v1/auth/user/recovery/verify',
}

export enum EmailOtp {
  Start = '/v2/auth/user/login/email_otp/start',
  Verify = '/v1/auth/user/login/email_otp/verify',
}

export enum EmailLink {
  Start = '/v2/auth/user/login/email/start',
  RedirectConfirm = '/v1/auth/user/login/email/confirm',
  Status = '/v1/auth/user/login/email/status',
  LoginVerify = '/v2/auth/user/login/verify',
  AnomalyApprove = '/v1/request_anomaly/approve',
  AnomalyBlock = '/v1/request_anomaly/block',
}

export enum OAuth {
  Verify = '/v1/auth/user/login/oauth/verify',
}

export enum Farcaster {
  Verify = '/v1/auth/user/login/farcaster/verify',
}

export enum LegacyOAuth {
  UserInfo = '/v1/oauth2/user/info/retrieve',
  Verify = '/v2/oauth/user/verify',
  SendCredential = '/v1/oauth2/credential/send',
  SendError = '/v1/oauth2/error/send',
}

export enum MFA {
  StartTemporaryOtpEnroll = '/v1/auth/user/enroll/totp/create',
  FinishTemporaryOtpEnroll = '/v1/auth/user/enroll/totp/enable',
  DisableTemporaryOtp = '/v1/auth/user/enroll/totp/disable',
  DisableTemporaryOtpRecoveryCode = '/v1/auth/user/enroll/codes/disable',
  VerifyTemporaryOtp = '/v1/auth/user/login/totp/verify',
  VerifyTemporaryOtpRecoveryCode = '/v1/auth/user/login/codes/verify',
}

export enum Redirect {
  Login = '/v2/auth/user/redirect/login',
}

export enum SMS {
  Start = '/v1/auth/user/login/phone/start',
  Verify = '/v1/auth/user/login/phone/verify',
}

export enum Oidc {
  Login = '/v1/auth/user/login/jwt/verify',
}

export enum DeviceVerification {
  DeviceProfile = '/v1/auth/user/device_profile',
}

export enum WebAuthn {
  RestrationStart = '/v1/auth/user/web_authn/registration/start',
  Register = '/v1/auth/user/web_authn/register',
  RegisterDeviceStart = '/v1/auth/user/web_authn/device/registration/start',
  RegisterDevice = '/v1/auth/user/web_authn/device/register',
  ReauthStart = '/v1/auth/user/web_authn/re_auth/start',
  ReauthVerify = '/v1/auth/user/web_authn/re_auth/verify',
  Unregister = '/v1/auth/user/web_authn/unregister',
  Update = '/v1/auth/user/web_authn/info/update',
}

export enum Universal {
  Start = '/v1/connect/user/login/email_otp/start',
  Sync = '/v1/connect/user/wallet/sync',
  UserInfoRetrieve = '/v1/connect/user/info/retrieve',
}

export enum LegacySignInWithGoogle {
  Start = '/v1/connect/user/login/jwt/start/google',
  Verify = '/v1/connect/user/login/jwt/verify',
}

export enum ThirdPartyWallet {
  Start = '/v1/connect/user/login/3p_wallet/start',
}

export enum Multichain {
  FlowSeedWallet = '/v1/auth/user/wallet/flow/seed',
  HederaSignMessage = '/v1/auth/user/wallet/hedera/message/sign',
  KadenaCreateWallet = '/v1/auth/user/wallet/kadena/create',
  KadenaVerifySpireKeyLogin = '/v1/auth/user/login/spirekey/verify',
}

export enum MandrakeAPI {
  MagicClientAPI = '/api/magic-client',
  MagicPassportAPI = '/api/passport',
}

export enum Nft {
  NftTokenInfo = '/v1/nft/token_info',
  PaypalClientToken = '/v1/nft/checkout/client_token',
  CreateOrder = '/v1/nft/checkout/create_order',
  AuthorizeOrder = '/v1/nft/checkout/authorize_order',
  RequestStatus = '/v1/nft/request/status',
  PaypalOrderDetails = '/v1/nft/checkout/payeremail',
}

export enum Ethereum {
  Proxy = '/v1/ethereum/provider/async/proxy',
  GasPriceEstimation = '/v1/ethereum/gas/price/estimation/retrieve',
}

export enum Onramp {
  StripeClientToken = '/v1/stripe/onramp/client_secret',
  SardineClientToken = '/v1/sardine/client_token',
  PaypalGetOrder = '/v1/paypal/crypto/orders',
  PaypalCreateOrder = '/v1/paypal/crypto/order-entries',
}

export enum ConfirmAction {
  Begin = '/v1/core/user/action/confirm/begin',
  Status = '/v1/core/user/action/confirm/status',
  Verify = '/v1/core/user/action/confirm/verify_token',
  Complete = '/v1/core/user/action/confirm/complete',
}

export enum Token {
  TokenPrice = '/v1/currency/convert',
}

export enum Gas {
  SubmitGaslessRequest = '/v1/relayer/submit-gasless-request',
  GetNonceAddition = '/v1/relayer/get-nonce-addition',
  GetRequestState = '/v1/relayer/get-request-state',
}

export enum PassportIdentity {
  Config = '/v1/app',
  CreateEmailChallenge = '/v1/auth/user_factor/email/create/challenge',
  VerifyFactor = '/v1/auth/user_factor/verify',
  CreatePasskeyChallene = '/v1/auth/user_factor/passkey/create/challenge',
  PasskeyChallenge = '/v1/auth/user_factor/passkey/challenge',
  OauthAuthorize = '/v1/authorize',
  OauthToken = '/v1/token',
  UserFactor = '/v1/auth/user_factor',
  PassportUser = '/v1/user',
  Logout = '/v1/auth/logout',
}

export enum MagicIndexer {
  GetTokenBalance = '/v1/token/balance',
  GetTokenMetadata = '/v1/token/metadata',
  GetNftsForOwner = '/v1/nft/nfts_for_owner',
}

export enum PassportOps {
  PassportWallet = '/v1/wallet',
}

export enum MagicApiWallet {
  RevealPK = '/v1/api/wallet/reveal_pk',
}

export enum NewtonExchange {
  RateLimitStatus = '/v1/exchange/rate_limit_status',
  Convert = '/v1/exchange/convert',
}

export const Endpoint = {
  Client,
  DeviceVerification,
  EmailOtp,
  EmailLink,
  AccountRecovery,
  LegacyOAuth,
  MagicClient,
  MFA,
  Oidc,
  Redirect,
  Session,
  SMS,
  User,
  MagicApiWallet,
  Wallet,
  WebAuthn,
  Universal,
  LegacySignInWithGoogle,
  ThirdPartyWallet,
  Multichain,
  MandrakeAPI,
  Nft,
  Ethereum,
  Onramp,
  ConfirmAction,
  Farcaster,
  Token,
  Gas,
  PassportIdentity,
  PassportOps,
  NewtonExchange,
  MagicIndexer,
};
