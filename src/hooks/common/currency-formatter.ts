import { useLocale } from '@hooks/common/locale';
import { useEffect, useState } from 'react';

export interface CurrencyFormatterProps {
  value: number;
  currency?: string;
}

interface FormatPartsProps {
  parts: Intl.NumberFormatPart[];
  fractionDigits: number;
}

export const formatParts = ({ parts, fractionDigits }: FormatPartsProps) => {
  if (!parts) return '';

  return parts
    ?.map(({ type, value }) => {
      if (type !== 'fraction' || !value || value.length < fractionDigits) {
        return value;
      }
      return value.slice(0, fractionDigits); // Ensure fraction digits are limited
    })
    .reduce((string, part) => `${string}${part}`, ''); // Combine all parts except currency symbol
};

export const useCurrencyFormatter = ({ value, currency = 'USD' }: CurrencyFormatterProps) => {
  const [formattedValue, setFormattedValue] = useState<string>('');
  const [currencySymbol, setCurrencySymbol] = useState<string>('');
  const locale = useLocale();

  useEffect(() => {
    const parts = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }).formatToParts(value);

    // Extract the formatted number (without the currency symbol)
    const formattedNumber = formatParts({
      parts: parts.filter(part => part.type !== 'currency'), // Exclude currency part
      fractionDigits: 2,
    });

    // Extract the currency symbol
    const symbol = parts.find(part => part.type === 'currency')?.value || currency;

    setFormattedValue(formattedNumber);
    setCurrencySymbol(symbol);
  }, [value, currency, locale]);

  return {
    value: value > 0 && formattedValue === '0.00' ? '<0.01' : formattedValue,
    symbol: currencySymbol,
    formattedValue: `${currencySymbol}${value > 0 && formattedValue === '0.00' ? '<0.01' : formattedValue}`,
  };
};
