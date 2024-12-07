import { OAuthVerifyResponse } from '@hooks/data/embedded/oauth';

export const mockAuthCodeParams =
  '?state=Wd9qWpAr4q3U8HdCCymyNJFVX02lfhWwyykE5qf.S650EEA%7EsDF5CwN4SMpVbPIWb38wxo3Kq8forumW9Jj.-qD_NQP48T56Vo7NM4Dq_vDV.PB9L1M_6X8UIC5fR16d&code=4%2F0AeaYSHAhCUqkndhWZY_-iHVrWz4WC_1-f2GG4Wcu6yPGsmTwnLL4jSzMBL1BvoJQ_t1YHw&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&authuser=0&hd=magic.link&prompt=none';

export const mockAuthCodeParamsWithError = '?authError=123abc';

export const mockOAuthResultParams =
  '?state=ggg999&code=123abc&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&authuser=0&hd=magic.link&prompt=none';

export const mockLegacyOAuthResultParams =
  '?provider=google&state=zsMcFsW&scope=openid+email+profile&magic_oauth_request_id=j3JItNV02oTLG-RMxoC9598JeN8vxdbYARa7GbqTFVc%3D&magic_credential=WyIweDUwYjYxNzNmODEx';

export const mockOAuthUserInfo = {
  sub: '109519826344480717759',
  name: 'John Doe',
  familyName: 'Doe',
  givenName: 'John',
  picture: 'https://lh3.googleusercontent.com/a/ACg8ocKiI1iR1hqf3Un7elpblQGrQEC_BeWbjMpTht67QUuC=s96-c',
  locale: 'en',
  email: 'john.doe@magic.link',
  emailVerified: true,
  sources: {
    'https://openidconnect.googleapis.com/v1/userinfo': {
      sub: '109519826344480717759',
      name: 'John Doe',
      familyName: 'Doe',
      givenName: 'John',
      picture: 'https://lh3.googleusercontent.com/a/ACg8ocKiI1iR1hqf3Un7elpblQGrQEC_BeWbjMpTht67QUuC=s96-c',
      locale: 'en',
      email: 'john.doe@magic.link',
      emailVerified: true,
      hd: 'magic.link',
    },
  },
};

export const mockLegacyOAuthCredentialSendResponse = {
  platform: 'web',
  query: '?magic_credential=12345',
  redirectURI: 'http://test.magic.link',
};

export const mockLegacyOAuthErrorSendResponse = {
  platform: 'web',
  query: '?error=ohnoes',
  redirectURI: 'http://error-test.magic.link',
};

export const mockLegacyOAuthClientMetaCookie = {
  magicApiKey: 'pk_live_abc123',
  encryptedAccessToken: '678910',
};

export const mockVerifyResponse: OAuthVerifyResponse = {
  authUserId: '123',
  authUserSessionToken: 'abcdef12345',
  oauthAccessToken: 'abcdef',
  userInfo: {
    email: 'tester@test.com',
    emailVerified: true,
    sub: '123',
  },
};

export const mockUserMetadata = {
  publicAddress: '0x12345',
  issuer: 'did:ethr:',
  email: 'test@magic.link',
  phoneNumber: null,
  isMfaEnabled: false,
  recoveryFactors: [],
};
