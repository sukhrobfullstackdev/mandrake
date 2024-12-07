import { usePassportStore } from '@hooks/data/passport/store';
import { mockDecodedParams1 } from '@mocks/query-params';

describe('@hooks/data/passportstore', () => {
  it('should have an initial state', () => {
    expect(usePassportStore.getState()).toEqual({
      magicApiKey: null,
      decodedQueryParams: {},
      messageEventListenerAdded: false,
      userId: null,
      isAppConfigHydrated: false,
      accessToken: null,
      refreshToken: null,
      email: null,
      existingPasskeyCredentialIds: [],
      eoaPublicAddress: null,
    });
  });

  it('should update state', () => {
    usePassportStore.setState({
      decodedQueryParams: mockDecodedParams1,
    });
    expect(usePassportStore.getState()).toEqual({
      decodedQueryParams: mockDecodedParams1,
      magicApiKey: 'pk_live_981D9DF7A41E9F11',
      messageEventListenerAdded: false,
      userId: null,
      isAppConfigHydrated: false,
      accessToken: null,
      refreshToken: null,
      email: null,
      existingPasskeyCredentialIds: [],
      eoaPublicAddress: null,
    });
  });
});
