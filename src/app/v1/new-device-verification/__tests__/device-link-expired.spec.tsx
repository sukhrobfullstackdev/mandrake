import { render, screen } from '@testing-library/react';
import { DeviceLinkExpired } from '@app/v1/new-device-verification/device-link-expired';

const setup = () => {
  return render(<DeviceLinkExpired />);
};

describe('DeviceVerificationStart', () => {
  beforeEach(() => {
    setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Device Approved Page', () => {
    expect(screen.getByText('Link expired')).toBeInTheDocument();
    expect(
      screen.getByText('Your login approval link has expired. Request a new one to continue.'),
    ).toBeInTheDocument();
  });
});
