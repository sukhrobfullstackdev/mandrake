'use client';

import CreateWallet from '@components/wallet/create-wallet';
import { IcoEmailOpen } from '@magiclabs/ui-components';

export default function LoginWithEmailOtpWalletPage() {
  return <CreateWallet pageIcon={<IcoEmailOpen />} />;
}
