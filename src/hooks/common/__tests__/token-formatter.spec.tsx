import { TokenFormatterProps, useTokenFormatter } from '@hooks/common/token-formatter';
import { render, screen } from '@testing-library/react';

function TestComponent({ value, token }: TokenFormatterProps) {
  const formattedValue = useTokenFormatter({ value, token });
  return <span>{formattedValue}</span>;
}

describe('TokenFormatter', () => {
  it('renders the formatted value for ETH', () => {
    const value = 1234.5678;
    const token = 'ETH';

    render(<TestComponent value={value} token={token} />);

    const content = screen.getByText('1,234.5678 ETH');
    expect(content).toBeInTheDocument();
  });

  it('renders the formatted value for MATIC', () => {
    const value = 1234.5678;
    const token = 'MATIC';

    render(<TestComponent value={value} token={token} />);

    const content = screen.getByText('1,234.5678 MATIC');
    expect(content).toBeInTheDocument();
  });

  it('renders the formatted value for less than one token', () => {
    const value = 0.5678;
    const token = 'MATIC';

    render(<TestComponent value={value} token={token} />);

    const content = screen.getByText('0.5678 MATIC');
    expect(content).toBeInTheDocument();
  });

  it('renders zero balance correctly', () => {
    const value = 0;
    const token = 'ETH';

    render(<TestComponent value={value} token={token} />);

    const content = screen.getByText('0 ETH');
    expect(content).toBeInTheDocument();
  });

  it('renders a maximum of six decimal places', () => {
    const value = 0.123456789;
    const token = 'MATIC';

    render(<TestComponent value={value} token={token} />);

    const content = screen.getByText('0.123456 MATIC');
    expect(content).toBeInTheDocument();
  });

  it('renders the less than symbol with the minimum amount shown', () => {
    const value = 0.0000006;
    const token = 'ETH';

    render(<TestComponent value={value} token={token} />);
    const content = screen.getByText('<0.000001 ETH');
    expect(content).toBeInTheDocument();
  });
});
