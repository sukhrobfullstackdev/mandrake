'use client';

import CreateWallet from '@components/wallet/create-wallet';
import { IcoMessage } from '@magiclabs/ui-components';

export default function LoginWithSmsWalletPage() {
  return <CreateWallet pageIcon={<IcoMessage />} />;
}
