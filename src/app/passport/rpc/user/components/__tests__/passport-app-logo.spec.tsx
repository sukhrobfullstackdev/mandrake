import PassportAppLogo from '@app/passport/rpc/user/components/passport-app-logo';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

interface Params {
  src?: string;
  alt?: string;
}

jest.mock('@magiclabs/ui-components', () => {
  const actual = jest.requireActual('@magiclabs/ui-components');
  return {
    ...actual,
    IcoRocketFill: () => <svg data-testid="icon-rocket" />,
  };
});

function setup({ src, alt }: Params) {
  PopupAtomicRpcPayloadService.setActiveRpcPayload({
    jsonrpc: '2.0',
    method: 'magic_passport_user_connect',
    id: '1',
    params: [],
  });

  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <PassportAppLogo src={src} alt={alt} />
    </QueryClientProvider>,
  );
}

describe('Passport App Logo Component', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the app logo', () => {
    setup({
      src: 'https://assets.stagef.magiclabs.com/logos/8aef1443-8c1b-4098-bdc9-408a9a8f696e/ddace43f3813a8df15cd605a7d4d4dbc5fcd434947cbc93ae3f45a17853be820020342f8fd093d34189991c67da6f545b759c82cc4de0ea6362a109e353bf15e.png',
    });

    const appImage = screen.getAllByRole('img')?.[0];
    expect(appImage).toBeInTheDocument();
    expect(appImage).toHaveAttribute('alt', 'Passport App Logo');
  });

  it('renders the default passport logo', () => {
    setup({
      alt: 'Default Passport App Logo',
    });
    expect(screen.getByTestId('icon-rocket')).toBeInTheDocument();
  });
});
