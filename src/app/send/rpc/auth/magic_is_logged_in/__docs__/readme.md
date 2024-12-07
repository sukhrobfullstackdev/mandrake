# Is Logged In

### About

Unsurprisingly, `isLoggedIn()` will return a boolean value depending on whether the current user has a valid session.

If we do not have an `authUserId` in state, then we will short circuit and resolve the JSON RPC Response Payload with `result: false`.

If we have an `authUserId` and `authUserSessionToken` in state we will attempt to generate a new user session token from the session token. We set the HTTP request header `DPoP` to the value of the `jwt` and pass the `rt` (refresh token) in the HTTP requst payload body as `auth_user_session_token` and perform an HTTP Post to `/v1/auth/user/session/refresh`.

The endpoint will verify the validity of the `auth_user_session_token` and the `DPoP` header. If validation of these inputs succeeds we will resolve the JSON RPC Request with `result: true`. If validation fails we will resolve the JSON RPC Request with `result: false`.

### SDK Method

```javascript
magic.user.isLoggedIn();
```

### Generic SDK Method

```javascript
const res = await getMagicInstance().rpcProvider.request({
  id: '1',
  method: 'magic_auth_is_logged_in',
  params: [],
  jsonrpc: '2.0',
});
```

### RPC Methods

`magic_is_logged_in`

`magic_auth_is_logged_in`

### Testing

#### isLoggedIn - true

- Complete an authentication flow such as `Magic.auth.loginWithMagicLink()`
- Call `magic.user.isLoggedIn()`. This will send a JSON RPC request payload with a method of `magic_is_logged_in`

#### isLoggedIn - false

- Complete an authentication flow such as `Magic.auth.loginWithMagicLink()`
- Call `magic.user.logout()`
- Call `magic.user.isLoggedIn()` which will return false
