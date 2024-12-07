export enum RpcErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  EmailLinkFailedVerification = -10000,
  EmailLinkExpired = -10001,
  EmailLinkRateLimited = -10002,
  UserAlreadyLoggedIn = -10003,
  UpdateEmailFailed = -10004,
  UserRequestEditEmail = -10005,
  EmailLinkInvalidRedirectURL = -10006,
  InactiveRecipient = -10010,
  AccessDeniedToUser = -10011,
  UserRejectedAction = -10012,
  RequestCancelled = -10014,
  RedirectLoginComplete = -10015,
  SessionTerminated = -10016,
  PopupRequestOverriden = -10017,
}

export enum RpcErrorMessage {
  // Internal error
  UserDeniedAccountAccess = 'Internal error: User denied account access.',
  UserCanceledAction = 'Internal error: User canceled action.',
  UnsupportedBlockchain = 'Internal error: Blockchain not supported. Please select a different blockchain network.',
  UserDeniedSigning = 'Internal error: User denied signing.',
  UserDisconnected = 'User disconnected from app.',
  GaslessTransactionsNotEnabled = 'Gasless transactions not enabled',
  FailedToFetchConfig = 'Internal error: Failed to fetch client config',
  InternalError = 'Internal server error',
  UserTerminatedSession = 'User terminated session',

  // Invalid params error
  MissingJWT = 'Missing jwt.',
  InvalidJwtOrProviderId = 'Invalid params: Invalid jwt or provider id.',
  InvalidPhoneNumber = 'Invalid params: Invalid phone number.',
  MalformedEmail = 'Invalid params: Please provide a valid email address.',
  InvalidParams = 'Invalid params: Invalid Rpc Request Parameters.',

  // Invalid request error
  UserLockoutLifted = 'Invalid request: User lockout lifted.',
  UserNotLoggedInWithWebAuthn = 'Invalid request: User is not logged in with WebAuthn!',
  UnableToFindWebauthnDevice = 'Invalid request: Unable to find the device.',

  // Others
  UserRequestEditEmail = 'User requests to edit the email address for authentication.',
  InsecureBrowserContext = 'Current environment is insecure, please check your browser environment',
  UserRejectedAction = 'User rejected the action',
  PopupRequestOverriden = 'User began a new action',

  // Ethereum proxy
  UnableToGetNetworkInfo = 'Unable to get network info',
  UnexpectedEthereumProxyError = 'Unexpected Ethereum Node Error',
  FeatureToggledMisConfigured = 'Feature toggled misconfigured',

  // OAuth
  MissingRequiredParams = "Missing required params in 'authorizationResponseParams'",
  StateParameterMismatches = 'State parameter mismatches.',
  MissingRequiredParamsFromStorage = 'Failed to finish OAuth verification. Missing required data in browser',
  MissingOAuthProviderConfiguration = 'Missing OAuth provider configuration',

  // MFA
  MFAAlreadyEnabled = 'MFA already enabled for the user',
  MFAAlreadyDisabled = 'No MFA factor found for the user',
  FeatureNotEnabled = 'Feature not enabled',

  // Auth
  UnauthorizedDomain = 'Unauthorized domain provided',

  // Wallet Hydration Error
  WalletHydrationError = 'Failed to get wallet. Please try again.',
  FailedToSignTransaction = 'Failed to sign transaction, Please try again.',

  // Signing
  SignerMismatch = 'Signer mismatch',
  SigningError = 'Error signing. Please try again',

  // Recover Account
  UserNotFound = 'Given user resource not found.',
  NoRecoveryMethodFound = 'No recovery methods found.',
}
