'use client';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { rejectPopupRequest } from '@hooks/common/popup/popup-json-rpc-request';
import { usePassportAppConfig } from '@hooks/data/passport/app-config';
import { usePassportStore } from '@hooks/data/passport/store';
import { useGetEOAWalletMutation } from '@hooks/data/passport/wallet';
import { useSmartAccount } from '@hooks/passport/use-smart-account';
import { useTranslation } from '@lib/common/i18n';
import { copyToClipboard } from '@lib/utils/copy';
import { WalletPage } from '@magiclabs/ui-components';
import React, { useCallback, useEffect } from 'react';

export default function WalletHeader() {
  const { smartAccount, isLoading } = useSmartAccount();
  const appConfig = usePassportAppConfig();

  const { t } = useTranslation('passport');
  const [connected, setConnected] = React.useState(true);

  const accessToken = usePassportStore(state => state.accessToken) || '';
  const { mutateAsync: getEOAWalletMutation } = useGetEOAWalletMutation();

  useEffect(() => {
    // If this works, user is connected
    const mutation = async () => {
      await getEOAWalletMutation({ accessToken });
    };

    mutation()
      .then(() => {
        setConnected(true);
      })
      .catch(() => {
        setConnected(false);
      });
  }, []);

  const onAddressCopy = useCallback((address: string) => {
    copyToClipboard(address);
  }, []);

  const disconnect = () => {
    rejectPopupRequest(RpcErrorCode.SessionTerminated, RpcErrorMessage.UserTerminatedSession);
  };

  const onLogout = useCallback(() => {
    usePassportStore.setState({
      refreshToken: null,
      accessToken: null,
      eoaPublicAddress: null,
    });
    rejectPopupRequest(RpcErrorCode.SessionTerminated, RpcErrorMessage.UserTerminatedSession);
  }, []);

  const walletAddress = smartAccount && !isLoading ? smartAccount.address : '';

  return (
    <>
      <WalletPage.Address address={walletAddress} onAddressCopy={onAddressCopy} />
      <WalletPage.ConnectionMenu
        connected={connected}
        connectedLabel={t('Connected')}
        domain={appConfig?.name || ''}
        logoUrl={appConfig?.logoUri}
        disconnectLabel={t('Disconnect')}
        onDisconnect={disconnect}
      />
      <WalletPage.AccountMenu logoutLabel={t('Log out from Passport')} onLogout={onLogout} />
    </>
  );
}
