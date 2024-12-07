# Legacy OAuth Credential Creation (OAuth V1)

## SDK Method

magic.oauth.loginWithRedirect()

## Description

One step of the loginWithRedirect flow with legacy OAuth. This step, executed on the client-side, handles every needed to create a "magic credentials" that is used in the "getRedirectResult" step of the OAuth flow.

### Testing

Currently, the legacy OAuth flow can only be tested in staging or prod environments due to the reverse proxy and the requirement of hitting the relayer server of the same origin.

In addition, this credential create step is executed from the relayer server. Thus, it is not an RPC route that can be controlled with a feature flag. Because of this, this credential create route is enabled via Cloudflare by reverse proxy re-writing the route to point to mandrake.

The exact route that needs to be re-written in CLoudflare is : `/v1/oauth2/credential/create`. Once added to the Cloudflare rules, it will point to Mandrake and can be tested successfully.

This can only work in environments where the reverse proxy is in affect. This means it cannot be tested in local or dynamic preview environments. We should look for a solution to this in the near future, or wait until everything is migrated and the reverse proxy is no longer needed.
