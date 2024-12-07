# Login with Email One Time Password (OTP)

#### SDK Method

magic.auth.loginWithEmailOtp()

#### RPC Method

magic_auth_login_with_email_otp

##### About

1. Verify Existing User Session
   1. If we successfully verify the session then we use that session token to fetch the user's wallet information
      1. If the user already has a wallet for the chain of the incoming request, we will return a DID Token
      1. If the user does not have a wallet for the chain of the incoming request, we will create a new wallet for the user and then return a DID Token
   1. If the session token is no longer valid...
2. Start Email OTP Flow...
3. Verify OTP...

##### Testing

1. Core Flow
   1. ...
1. Custom Authentication
   1. ...
