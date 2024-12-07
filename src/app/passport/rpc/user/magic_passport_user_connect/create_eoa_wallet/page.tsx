'use client';

import PassportCheckmark from '@app/passport/rpc/user/components/passport-checkmark';
import PassportLoadingSpinner from '@app/passport/rpc/user/components/passport-loading-spinner';
import { Endpoint } from '@constants/endpoint';
import { PassportPageErrorCodes } from '@constants/passport-page-errors';
import { PASSPORT_ERROR_URL } from '@constants/routes';
import { usePassportRouter } from '@hooks/common/passport-router';
import { usePassportStore } from '@hooks/data/passport/store';
import { useCreateEOAWalletMutation } from '@hooks/data/passport/wallet';
import { useTranslation } from '@lib/common/i18n';
import { HttpService } from '@lib/http-services';
import { PassportPage } from '@magiclabs/ui-components';
import { useEffect, useState } from 'react';

export default function CreateEAOWalletPage() {
  const { t } = useTranslation('passport');

  const router = usePassportRouter();
  const { accessToken } = usePassportStore.getState();
  const [isEOAWalletCreated, setIsEOAWalletCreated] = useState(false);
  const { mutateAsync: createWalletMutation } = useCreateEOAWalletMutation();

  const network = usePassportStore(state => state.decodedQueryParams.network);

  const createWallet = async () => {
    try {
      if (!network) throw new Error('Network not found');
      if (!accessToken) throw new Error('No access token found');

      const passportEOAWallet = await createWalletMutation();

      const eoaPublicAddress = passportEOAWallet.publicAddress;

      usePassportStore.setState({ eoaPublicAddress });

      // Enable CAB client server-side
      HttpService.Mandrake.Post(`${origin}${Endpoint.MandrakeAPI.MagicPassportAPI}/setup-new-account`, undefined, {
        eoaPublicAddress,
        accessToken,
        network,
      });

      setIsEOAWalletCreated(true);

      router.replace('/passport/rpc/user/magic_passport_user_connect/authorize_dapp');
    } catch (error) {
      logger.info('passkey create eoa wallet error', error);
      usePassportStore.setState({ eoaPublicAddress: null, accessToken: null });
      router.replace(PASSPORT_ERROR_URL(PassportPageErrorCodes.WALLET_ERROR));
    }
  };
  useEffect(() => {
    router.prefetch('/passport/rpc/user/magic_passport_user_connect/authorize_dapp');

    createWallet();
  }, []);

  return (
    <PassportPage.Content>
      {isEOAWalletCreated ? (
        <PassportCheckmark />
      ) : (
        <PassportLoadingSpinner text={t(`Creating your passkey wallet. Please don't close this window.`)} />
      )}
    </PassportPage.Content>
  );
}
