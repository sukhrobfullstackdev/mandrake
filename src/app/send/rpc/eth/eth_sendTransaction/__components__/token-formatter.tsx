import { useTokenFormatter } from '@hooks/common/token-formatter';

interface TokenFormatterProps {
  value: number;
  token?: string;
}

export const TokenFormatter = ({ value = 0, token = 'ETH' }: TokenFormatterProps) => {
  const formattedValue = useTokenFormatter({ value, token });
  return <span>{formattedValue}</span>;
};
