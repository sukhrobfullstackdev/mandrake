import { useStore } from '@hooks/store';
import { mockDecodedParams1 } from '@mocks/query-params';

describe('@hooks/store', () => {
  it('should have an initial state', () => {
    expect(useStore.getState()).toEqual({
      magicApiKey: null,
      messageEventListenerAdded: false,
      sdkMetaData: null,
      decodedQueryParams: {},
      authUserId: null,
      authUserSessionToken: null,
      email: null,
      phoneNumber: null,
      isGlobalAppScope: false,
      mfaEnrollSecret: null,
      mfaEnrollInfo: null,
      mfaRecoveryCodes: [],
      isAppConfigHydrated: false,
      customAuthorizationToken: null,
      systemClockOffset: 0,
    });
  });

  it('should update state', () => {
    useStore.setState({
      decodedQueryParams: mockDecodedParams1,
    });
    expect(useStore.getState()).toEqual({
      decodedQueryParams: mockDecodedParams1,
      magicApiKey: 'pk_live_981D9DF7A41E9F11',
      messageEventListenerAdded: false,
      sdkMetaData: null,
      authUserId: null,
      authUserSessionToken: null,
      email: null,
      phoneNumber: null,
      isGlobalAppScope: false,
      mfaEnrollSecret: null,
      mfaEnrollInfo: null,
      mfaRecoveryCodes: [],
      isAppConfigHydrated: false,
      customAuthorizationToken: null,
      systemClockOffset: 0,
    });
  });
});
