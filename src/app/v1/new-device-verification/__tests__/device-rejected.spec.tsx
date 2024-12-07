import { DeviceRejected } from '@app/v1/new-device-verification/device-rejected';
import { TEST_CONFIG } from '@mocks/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

const setup = () => {
  const queryClient = new QueryClient(TEST_CONFIG);
  return render(
    <QueryClientProvider client={queryClient}>
      <DeviceRejected />
    </QueryClientProvider>,
  );
};

jest.mock('@common/i18n', () => ({
  ...jest.requireActual('@common/i18n'),
  T: ({ translate }: { translate: string }) => <span>{translate}</span>,
}));

describe('DeviceRejected', () => {
  beforeEach(() => {
    setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Device Rejected Page', () => {
    expect(screen.getByText('Login request rejected')).toBeInTheDocument();
    expect(screen.getByText("We've stopped the unrecognized device from accessing your account.")).toBeInTheDocument();

    const textMatcher: (content: string, element: Element | null) => boolean = (content, element) => {
      if (!element) return false;

      const hasText = (node: Element) =>
        node.textContent === 'Made a mistake? Head back to <appName/> to restart the login process.';
      const elementHasTargetText = hasText(element);
      const childrenExcludeText = Array.from(element.children).every(child => !hasText(child));

      return elementHasTargetText && childrenExcludeText;
    };

    expect(screen.getByText(textMatcher)).toBeInTheDocument();
  });
});
