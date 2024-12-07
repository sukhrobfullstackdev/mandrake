import { useLocale } from '@hooks/common/locale';
import { useEffect, useState } from 'react';

export interface TokenFormatterProps {
  value: number;
  token?: string;
}

type FormatPartsProps = {
  parts: Intl.NumberFormatPart[];
  fractionDigits: number;
};

const formatParts = ({ parts, fractionDigits }: FormatPartsProps) => {
  return parts
    .map(({ type, value }) => {
      if (type !== 'fraction' || !value || value.length < fractionDigits) {
        return value;
      }

      return value.slice(0, fractionDigits);
    })
    .reduce((string, part) => `${string}${part}`);
};

export const useTokenFormatter = ({ value = 0, token = 'ETH' }: TokenFormatterProps): string => {
  const [formattedValue, setFormattedValue] = useState<string>('');
  const locale = useLocale();

  useEffect(() => {
    setFormattedValue(
      formatParts({
        parts: new Intl.NumberFormat(locale, {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 20,
        }).formatToParts(value),
        fractionDigits: 6,
      }),
    );
  }, [value, token, locale]);

  return `${value > 0 && formattedValue === '0.000000' ? '<0.000001' : formattedValue} ${token}`;
};
