import { CurrencyFormatterProps, useCurrencyFormatter } from '@hooks/common/currency-formatter';
import { useLocale } from '@hooks/common/locale';
import { render, screen } from '@testing-library/react';

function TestComponent({ value, currency = 'USD' }: CurrencyFormatterProps) {
  const { formattedValue } = useCurrencyFormatter({ value, currency });
  return <span>{formattedValue}</span>;
}

jest.mock('@hooks/common/locale', () => ({
  useLocale: jest.fn(() => {
    return 'en-US';
  }),
}));
describe('useCurrencyFormatter', () => {
  it('renders $0', () => {
    const value = 0;
    render(<TestComponent value={value} />);

    const content = screen.getByText('$0.00');
    expect(content).toBeInTheDocument();
  });

  it('rounds down to $1.23', () => {
    const value = 1.235;
    render(<TestComponent value={value} />);

    const content = screen.getByText('$1.23');
    expect(content).toBeInTheDocument();
  });

  it('renders value in hundreds correctly', () => {
    const value = 123;
    render(<TestComponent value={value} />);

    const content = screen.getByText('$123.00');
    expect(content).toBeInTheDocument();
  });

  it('renders value in thousands correctly', () => {
    const value = 1235;
    render(<TestComponent value={value} />);

    const content = screen.getByText('$1,235.00');
    expect(content).toBeInTheDocument();
  });

  it('renders value in tens of thousands correctly with decimals', () => {
    const value = 12356.1;
    render(<TestComponent value={value} />);

    const content = screen.getByText('$12,356.10');
    expect(content).toBeInTheDocument();
  });

  it('renders value in hundreds of thousands correctly', () => {
    const value = 123578;
    render(<TestComponent value={value} />);

    const content = screen.getByText('$123,578.00');
    expect(content).toBeInTheDocument();
  });

  it('renders value in millions correctly', () => {
    const value = 1235789;
    render(<TestComponent value={value} />);

    const content = screen.getByText('$1,235,789.00');
    expect(content).toBeInTheDocument();
  });

  it('renders German Euros', () => {
    const value = 0.12;
    const currency = 'EUR';
    (useLocale as jest.Mock).mockReturnValue('de-DE');
    render(<TestComponent value={value} currency={currency} />);

    const content = screen.getByText('€0,12');
    expect(content).toBeInTheDocument();
  });
});
