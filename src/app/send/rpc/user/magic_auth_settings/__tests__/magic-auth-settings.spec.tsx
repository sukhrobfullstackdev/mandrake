import MagicAuthSettings from '@app/send/rpc/user/magic_auth_settings/page';
import { useAssetUri, useColorMode } from '@hooks/common/client-config';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@hooks/common/launch-darkly', () => ({
  useFlags: jest.fn(),
}));

jest.mock('@hooks/common/send-router', () => ({
  useSendRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@hooks/common/client-config', () => ({
  useAppName: jest.fn(),
  useAssetUri: jest.fn(),
  useCustomBrandingType: jest.fn(),
  useColorMode: jest.fn(),
  useClientHasMfa: jest.fn(),
}));

jest.mock('@magiclabs/ui-components', () => {
  const actual = jest.requireActual('@magiclabs/ui-components');
  return {
    ...actual,
    IconProfileDark: () => <svg data-testid="icon-profile-dark" />,
    IconProfileLight: () => <svg data-testid="icon-profile-light" />,
  };
});

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <MagicAuthSettings />
    </QueryClientProvider>,
  );
}

describe('MagicAuthSettings', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders IconProfileLight when themeColor is light', async () => {
    (useColorMode as jest.Mock).mockReturnValue('light');
    await act(() => setup());
    expect(screen.getByTestId('icon-profile-light')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-profile-dark')).not.toBeInTheDocument();
  });

  it('renders IconProfileDark when themeColor is dark', async () => {
    (useColorMode as jest.Mock).mockReturnValue('dark');
    await act(() => setup());
    expect(screen.getByTestId('icon-profile-dark')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-profile-light')).not.toBeInTheDocument();
  });

  it('renders client logo when assetUri is present', async () => {
    (useAssetUri as jest.Mock).mockReturnValue('http://test-src.com/');
    await act(() => setup());
    expect(screen.getByAltText('logo')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-profile-light')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-profile-dark')).not.toBeInTheDocument();
  });
});
