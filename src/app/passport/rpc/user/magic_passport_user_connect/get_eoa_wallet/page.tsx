'use client';

import PassportCheckmark from '@app/passport/rpc/user/components/passport-checkmark';
import PassportLoadingSpinner from '@app/passport/rpc/user/components/passport-loading-spinner';
import { PassportPageErrorCodes } from '@constants/passport-page-errors';
import { PASSPORT_ERROR_URL } from '@constants/routes';
import { usePassportRouter } from '@hooks/common/passport-router';
import { usePassportStore } from '@hooks/data/passport/store';
import { useGetEOAWalletMutation } from '@hooks/data/passport/wallet';
import { useTranslation } from '@lib/common/i18n';
import { PassportPage } from '@magiclabs/ui-components';
import { useEffect, useState } from 'react';

export default function GetPassportEOAWalletPage() {
  const router = usePassportRouter();
  const {
    accessToken,
    decodedQueryParams: { network },
  } = usePassportStore.getState();

  const [isFetchingWallet, setIsFetchingWallet] = useState(false);
  const { mutateAsync: getEOAWalletMutation } = useGetEOAWalletMutation();
  const { t } = useTranslation('passport');

  useEffect(() => {
    router.prefetch('/passport/rpc/user/magic_passport_user_connect/authorize_dapp');

    const getWallet = async () => {
      try {
        if (!accessToken) throw new Error('No access token found');
        if (!network) throw new Error('No network found');

        const passportEOAWallet = await getEOAWalletMutation({
          accessToken,
        });

        if (!passportEOAWallet) throw new Error('No EOA wallet found');

        usePassportStore.setState({
          eoaPublicAddress: passportEOAWallet.publicAddress,
        });

        setIsFetchingWallet(true);
        return router.replace('/passport/rpc/user/magic_passport_user_connect/authorize_dapp');
      } catch (error) {
        logger.info('get eoa wallet error', error);
        logger.error('Error fetching EOA wallet', error);
        return router.replace(PASSPORT_ERROR_URL(PassportPageErrorCodes.WALLET_ERROR));
      }
    };

    getWallet();
  }, []);

  return (
    <PassportPage.Content>
      {isFetchingWallet ? <PassportCheckmark /> : <PassportLoadingSpinner text={t('Retrieving your passkey wallet')} />}
    </PassportPage.Content>
  );
}
