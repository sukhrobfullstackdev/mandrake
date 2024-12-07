import { useCurrencyFormatter } from '@hooks/common/currency-formatter';

interface CurrencyFormatterProps {
  value: number;
  currency?: string;
  locale?: string;
}

export const CurrencyFormatter = ({ value, currency = 'USD' }: CurrencyFormatterProps) => {
  const { formattedValue } = useCurrencyFormatter({ value, currency });
  return <span>{formattedValue}</span>;
};
