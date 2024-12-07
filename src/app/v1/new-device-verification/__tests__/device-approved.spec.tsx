import { DeviceApproved } from '@app/v1/new-device-verification/device-approved';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <DeviceApproved />
    </QueryClientProvider>,
  );
};

jest.mock('@common/i18n', () => ({
  ...jest.requireActual('@common/i18n'),
  T: ({ translate }: { translate: string }) => <span>{translate}</span>,
}));

describe('DeviceVerificationStart', () => {
  beforeEach(() => {
    setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Device Approved Page', () => {
    expect(screen.getByText('Login Approved')).toBeInTheDocument();

    const textMatcher: (content: string, element: Element | null) => boolean = (content, element) => {
      if (!element) return false;

      const hasText = (node: Element) => node.textContent === 'Go back to <appName/> to finish logging in.';
      const elementHasTargetText = hasText(element);
      const childrenExcludeText = Array.from(element.children).every(child => !hasText(child));

      return elementHasTargetText && childrenExcludeText;
    };

    expect(screen.getByText(textMatcher)).toBeInTheDocument();
    expect(screen.getByText('You can now close this tab.')).toBeInTheDocument();
  });
});
