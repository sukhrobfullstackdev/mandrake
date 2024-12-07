import ErrorPage from '@app/passport/error/page';
import { PassportPageErrorCodes, PassportPageErrors } from '@constants/passport-page-errors';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

function setup({ searchParams }: { searchParams: { code: string } }) {
  PopupAtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_passport_user_connect',
    id: '1',
    params: [],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <ErrorPage searchParams={searchParams} />
    </QueryClientProvider>,
  );
}

describe('Passport Error Page', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the passport error page with the heading and body', () => {
    setup({ searchParams: { code: PassportPageErrorCodes.INVALID_API_KEY } });
    const pageError = PassportPageErrors[PassportPageErrorCodes.INVALID_API_KEY];
    const errorHeading = screen.getAllByText(pageError.heading)?.[0];
    const errorBody = screen.getAllByText(pageError.body)?.[0];

    expect(errorHeading).toBeInTheDocument();
    expect(errorBody).toBeInTheDocument();
  });
});
