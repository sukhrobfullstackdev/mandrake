'use client';

import { PassportPageErrorCodes } from '@constants/passport-page-errors';
import { PASSPORT_ERROR_URL } from '@constants/routes';
import { usePassportRouter } from '@hooks/common/passport-router';
import { usePassportStore } from '@hooks/data/passport/store';
import { WalletPage } from '@magiclabs/ui-components';
import { PropsWithChildren, useEffect } from 'react';

export default function MagicPassportWallet({ children }: PropsWithChildren) {
  const router = usePassportRouter();
  const { accessToken, eoaPublicAddress } = usePassportStore.getState();

  useEffect(() => {
    if (!accessToken || !eoaPublicAddress) {
      return router.push(PASSPORT_ERROR_URL(PassportPageErrorCodes.USER_SESSION_NOT_FOUND));
    }
  }, [accessToken, eoaPublicAddress]);

  return <WalletPage>{children}</WalletPage>;
}
