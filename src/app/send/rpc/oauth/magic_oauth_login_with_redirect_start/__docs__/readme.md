# OAuth Login with Redirect

## SDK Method

magic.oauth2.loginWithRedirect()

## RPC Method

magic_oauth_login_with_redirect_start

## Description

This is the first part of the OAuth flow that handles allow list checking, generating a code verifier, and constructing the authorization code endpoint url. This URL will ultimately be returned back up to the SDK for redirection.

## Testing

To test this specific RPC route, you will need to enable the feature flag `rpc-route-magic-oauth-login-with-redirect-start-enabled`.
