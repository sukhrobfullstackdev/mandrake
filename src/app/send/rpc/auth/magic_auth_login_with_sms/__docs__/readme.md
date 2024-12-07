# Login With SMS

### About

Login with SMS

### SDK Method

```javascript
magic.auth.loginWithSms();
```

### Generic SDK Method

```javascript
const res = await getMagicInstance().rpcProvider.request({
  id: '1',
  method: 'magic_auth_login_with_sms',
  params: [{ phoneNumber: '+15555555555' }],
  jsonrpc: '2.0',
});
```

### RPC Methods

`magic_auth_login_with_sms`

### Testing

Enable SMS Login on Dashboard
