import { ConnectWithUILoginMethod, ConnectWithUILoginType } from '@custom-types/connect-with-ui';
import { OAuthProvider } from '@custom-types/oauth';
import { RELAYER_LAST_LOGGED_IN_WITH_METHOD } from '@app/send/rpc/wallet/mc_login/constants';
import { useEffect, useState } from 'react';
import { useFlags } from '@hooks/common/launch-darkly';
import { useStore } from '@hooks/store';

const lastLoginWasSocial = (lastLoggedInMethod = '') => {
  return Object.values(OAuthProvider).includes(lastLoggedInMethod as OAuthProvider);
};

export const useConnectWithUIMethod = () => {
  const flags = useFlags();
  const [lastLoggedInType, setLastLoggedInType] = useState<ConnectWithUILoginType>(ConnectWithUILoginMethod.UNKNOWN);
  const [loginType, setLoginType] = useState<ConnectWithUILoginType>(ConnectWithUILoginMethod.EMAIL);

  const { isGlobalAppScope } = useStore.getState();

  const isLegacyGoogleSignInEnabled = isGlobalAppScope;
  const isSocialWidgetEnabled = !isGlobalAppScope && flags?.socialWidgetsV2?.enabled;

  useEffect(() => {
    const storedValue = localStorage.getItem(RELAYER_LAST_LOGGED_IN_WITH_METHOD) as ConnectWithUILoginType | undefined;

    if (lastLoginWasSocial(storedValue) && isSocialWidgetEnabled) {
      setLastLoggedInType(OAuthProvider.GOOGLE);
      setLoginType(OAuthProvider.GOOGLE);
      return;
    }

    if (storedValue === ConnectWithUILoginMethod.LEGACY_GOOGLE_SIGN_IN && isLegacyGoogleSignInEnabled) {
      setLastLoggedInType(ConnectWithUILoginMethod.LEGACY_GOOGLE_SIGN_IN);
      setLoginType(ConnectWithUILoginMethod.LEGACY_GOOGLE_SIGN_IN);
      return;
    }

    if (storedValue === ConnectWithUILoginMethod.EMAIL) {
      setLastLoggedInType(ConnectWithUILoginMethod.EMAIL);
      setLoginType(ConnectWithUILoginMethod.EMAIL);
      return;
    }

    // Unrecognized stored value, clear it
    localStorage.removeItem(RELAYER_LAST_LOGGED_IN_WITH_METHOD);

    // No valid last login method found, default to social login if enabled
    if (isLegacyGoogleSignInEnabled) {
      setLoginType(ConnectWithUILoginMethod.LEGACY_GOOGLE_SIGN_IN);
      return;
    }
    if (isSocialWidgetEnabled) {
      setLoginType(OAuthProvider.GOOGLE);
      return;
    } // Fallback to Google for all social logins

    setLoginType(ConnectWithUILoginMethod.EMAIL);
  }, [isLegacyGoogleSignInEnabled, isSocialWidgetEnabled]);

  return { lastLoggedInType, loginType, setLoginType, isLegacyGoogleSignInEnabled, isSocialWidgetEnabled };
};
