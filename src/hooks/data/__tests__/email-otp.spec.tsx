import { Endpoint } from '@constants/endpoint';
import { useLoginWithEmailOtpVerify, useSendEmailOtpStartQuery } from '@hooks/data/embedded/email-otp';
import { HttpService } from '@http-services';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

describe('email-otp', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.spyOn(HttpService.Magic, 'Post').mockImplementation(() => Promise.resolve({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('useSendEmailOtpStartQuery should call HttpService with correct params', async () => {
    const { result } = renderHook(() => useSendEmailOtpStartQuery(), { wrapper });
    const params = {
      email: 'test@example.com',
      requestOriginMessage: 'test-message',
      jwt: 'test-jwt',
      overrides: { variation: 'test-variation' },
    };

    const endpoint = `${Endpoint.EmailOtp.Start}`;

    const headers = { 'X-Magic-Scope': '', dpop: params.jwt, 'ua-sig': '' };

    await result.current.mutate(params);

    await waitFor(() =>
      expect(HttpService.Magic.Post).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining(headers),
        expect.objectContaining({
          email: params.email,
          request_origin_message: params.requestOriginMessage,
          overrides: params.overrides,
        }),
      ),
    );
  });

  test('useLoginWithEmailOtpVerify should call HttpService with correct params', async () => {
    const { result } = renderHook(() => useLoginWithEmailOtpVerify(), { wrapper });
    const params = {
      email: 'test@example.com',
      requestOriginMessage: 'test-message',
      oneTimeCode: '123456',
      loginFlowContext: 'login-flow-context',
      jwt: 'test-jwt',
    };

    const endpoint = Endpoint.EmailOtp.Verify;

    const headers = { dpop: params.jwt };

    await result.current.mutate(params);

    await waitFor(() =>
      expect(HttpService.Magic.Post).toHaveBeenCalledWith(
        endpoint,
        expect.objectContaining(headers),
        expect.objectContaining({
          email: params.email,
          request_origin_message: params.requestOriginMessage,
          one_time_code: params.oneTimeCode,
          login_flow_context: params.loginFlowContext,
        }),
      ),
    );
  });
});
