'use-client';

import { IcoExternalLink } from '@magiclabs/ui-components';
import { token } from '@styled/tokens';
import Link from 'next/link';

interface PayPalTransactionLinkProps {
  transactionLink?: string;
}

const PayPalTransactionLink = ({ transactionLink }: PayPalTransactionLinkProps) => {
  if (!transactionLink) {
    return null;
  }

  return (
    <Link href={transactionLink} target="_blank" rel="noopener noreferrer">
      <IcoExternalLink color={token('colors.brand.base')} width={12} height={12} />
    </Link>
  );
};

export default PayPalTransactionLink;
