import { RpcErrorMessage } from '@constants/json-rpc';
import { useStore } from '@hooks/store';
import { mockOAuthResultParams, mockVerifyResponse } from '@mocks/oauth';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import { OAuthVerify, Props } from '../oauth-verify';

const mockOnFinish = jest.fn();
const mockVerifyMutation = jest.fn();

jest.mock('@hooks/data/embedded/oauth', () => ({
  useOAuthVerifyMutation: () => ({
    mutate: mockVerifyMutation,
    data: mockVerifyResponse,
  }),
}));

interface SetupParams {
  propsOverride?: Partial<Props>;
}

const setup = ({ propsOverride = {} }: SetupParams = {}) => {
  useStore.setState({
    sdkMetaData: {
      webCryptoDpopJwt: '12345',
    },
  });

  const props: Props = {
    redirectUri: 'https://test.com',
    authorizationResponseParams: mockOAuthResultParams,
    state: 'ggg999',
    codeVerifier: '12345',
    appID: 'abcdefg',
    onFinished: mockOnFinish,
    ...propsOverride,
  };

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <OAuthVerify {...props} />
    </QueryClientProvider>,
  );
};

describe('OAuthVerify component', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders and calls oauthVerifyMutate', async () => {
    await act(async () => {
      await setup();
    });

    expect(mockVerifyMutation).toHaveBeenCalledWith(
      {
        appID: 'abcdefg',
        authorizationCode: '123abc',
        codeVerifier: '12345',
        redirectURI: 'https://test.com',
        jwt: '12345',
      },
      expect.anything(),
    );
  });

  it('on finish callback is called with an error if states do not match', async () => {
    await act(async () => {
      await setup({ propsOverride: { state: '890-different-than-param-state' } });
    });

    expect(mockOnFinish).toHaveBeenCalledWith(
      expect.objectContaining({
        isSuccess: false,
        data: { errorCode: -32600, errorMessage: 'State parameter mismatches.' },
      }),
    );
  });

  it('on finish callback is called with an error if oauth rresponse contains an error', async () => {
    await act(async () => {
      await setup({ propsOverride: { authorizationResponseParams: 'error=onoes&error_description=badthings' } });
    });

    expect(mockOnFinish).toHaveBeenCalledWith(
      expect.objectContaining({
        isSuccess: false,
        data: { errorCode: -32600, errorMessage: RpcErrorMessage.MissingRequiredParams },
      }),
    );
  });
});
