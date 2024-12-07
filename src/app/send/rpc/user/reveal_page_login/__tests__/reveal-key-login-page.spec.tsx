import { useAssetUri } from '@hooks/common/client-config';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import RevealKeyLogin from '../page';

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@hooks/common/client-config', () => ({
  useAssetUri: jest.fn(),
  useConfiguredAuthProviders: jest.fn(),
  useCustomBrandingType: jest.fn(),
}));

jest.mock('@magiclabs/ui-components', () => {
  const actual = jest.requireActual('@magiclabs/ui-components');
  return {
    ...actual,
    PresentationLogo: () => <svg data-testid="presentation-logo" />,
  };
});

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <RevealKeyLogin />
    </QueryClientProvider>,
  );
}

describe('RevealKeyLogin', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a placeholder icon when assetUri is empty', () => {
    (useAssetUri as jest.Mock).mockReturnValue('');
    setup();
    expect(screen.getByTestId('presentation-logo')).toBeInTheDocument();
  });

  it('renders client logo when assetUri is present', () => {
    (useAssetUri as jest.Mock).mockReturnValue('http://test-src.com/');
    setup();
    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });
});
