import { LoginProvider } from '@components/reveal-private-key/__type__';
import AdditionalProviders from '@components/reveal-private-key/additional-providers';
import { useConfiguredAuthProviders } from '@hooks/common/client-config';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

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

function setup() {
  const queryClient = new QueryClient(TEST_CONFIG);

  return render(
    <QueryClientProvider client={queryClient}>
      <AdditionalProviders focusedProvider={LoginProvider.LINK} setFocusedProvider={() => {}} />
    </QueryClientProvider>,
  );
}

describe('AdditionalProviders', () => {
  it('renders OR separator when there is more than 1 primary provider', () => {
    (useConfiguredAuthProviders as jest.Mock).mockReturnValue({ primaryLoginProviders: ['link', 'sms'] });
    setup();
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('renders OR separator when there is 1 primary provider and at least 1 social provider', () => {
    (useConfiguredAuthProviders as jest.Mock).mockReturnValue({
      primaryLoginProviders: ['link'],
      socialLoginProviders: ['google'],
    });
    setup();
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it("doesn't render OR separator when there is 1 primary provider and no social providers", () => {
    (useConfiguredAuthProviders as jest.Mock).mockReturnValue({
      primaryLoginProviders: ['link'],
    });
    setup();
    expect(screen.queryByText('OR')).not.toBeInTheDocument();
  });

  it("doesn't render OR separator when there are only social providers", () => {
    (useConfiguredAuthProviders as jest.Mock).mockReturnValue({
      socialLoginProviders: ['google', 'twitter', 'facebook'],
    });
    setup();
    expect(screen.queryByText('OR')).not.toBeInTheDocument();
  });

  it("doesn't render a button for the focused provider", () => {
    (useConfiguredAuthProviders as jest.Mock).mockReturnValue({
      primaryLoginProviders: ['link', 'sms'],
    });
    setup();
    expect(screen.queryByRole('button', { name: /Email/i })).not.toBeInTheDocument();
  });
});
