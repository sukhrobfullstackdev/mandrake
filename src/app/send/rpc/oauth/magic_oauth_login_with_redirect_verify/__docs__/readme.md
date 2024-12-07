# OAuth Login with Redirect

## SDK Method

magic.oauth2.getRedirectResults()

## RPC Method

magic_oauth_login_with_redirect_verify

## Description

This is the first part of the OAuth flow that handles the response of the authorization code redirection back to the develop application. Once started, it will validate the response, call Fortmatic API to verify and/or create the user, and hydrate the session.

## Testing

To test this specific RPC route, you will need to enable the feature flag `rpc-route-magic-oauth-login-with-redirect-verify-enabled`.
