import { SignMessageDetails } from '@app/confirm-action/__components__/sign-message-details/sign-message-details';
import { ActionStatus } from '@custom-types/confirm-action';
import { render, screen } from '@testing-library/react';

// Mock the AppNameCollapsible component
jest.mock('@components/sign-typed-data/sign-typed-data-page', () => ({
  AppNameCollapsible: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="appNameCollapsible">{children}</div>
  ),
}));

jest.mock('@lib/common/i18n', () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: (key: string, values?: any) => {
      if (values && values.appName) {
        return `Confirm your ${values.appName} signature`;
      }
      return key;
    },
  }),
}));

describe('SignMessageDetails Component', () => {
  const defaultProps = {
    appName: 'TestApp',
    message: 'This is a test message',
    requestDomain: 'example.com',
    actionStatus: ActionStatus.PENDING,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders confirmation details correctly when actionStatus is PENDING', () => {
    render(<SignMessageDetails {...defaultProps} />);

    expect(screen.getByText('Confirm your TestApp signature')).toBeInTheDocument();
    expect(screen.getByTestId('appNameCollapsible')).toBeInTheDocument();
    expect(screen.getByText('This is a test message')).toBeInTheDocument();
  });

  it('renders rejection message correctly when actionStatus is REJECTED', () => {
    render(<SignMessageDetails {...defaultProps} actionStatus={ActionStatus.REJECTED} />);

    expect(screen.getByText('You rejected the signature')).toBeInTheDocument();
  });

  it('renders approval message correctly when actionStatus is APPROVED', () => {
    render(<SignMessageDetails {...defaultProps} actionStatus={ActionStatus.APPROVED} />);

    expect(screen.getByText('You successfully approved the signature!')).toBeInTheDocument();
  });
});
