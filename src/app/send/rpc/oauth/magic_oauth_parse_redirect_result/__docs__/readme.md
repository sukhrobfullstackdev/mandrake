# Legacy OAuth Redirect Result

## SDK Method

magic.oauth.getRedirectResult()

## RPC Method

magic_oauth_parse_redirect_result

## Description

This is the second part of the legacy OAuth flow that handles parsing the authorization token response and finalizing authentication and hydration of the user.

## Testing

To test this specific RPC route, you will need to enable the feature flag `rpc-route-magic-oauth-parse-redirect-result-enabled`. 

Note, currently there are some hurdles to get past to test this locally and connecting to relayer server endpoint successfully. For the current situation, it is advisable to test this in a reverse proxy environment (staging or prod). 