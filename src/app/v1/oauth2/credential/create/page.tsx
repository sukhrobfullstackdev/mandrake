/* istanbul ignore file */
'use client';

import { useLoginContext } from '@app/send/login-context';
import {
  OAUTH_CLIENT_META_COOKIE,
  OAUTH_LOGIN_FLOW_CONTEXT_COOKIE,
  OAUTH_MFA_FACTORS_REQUIRED_COOKIE,
} from '@constants/cookies';
import { MfaFactors } from '@custom-types/api-response';
import { OAuthClientMetaData } from '@custom-types/cookies';
import { useResetAuthState } from '@hooks/common/auth-state';
import { useStore } from '@hooks/store';
import { parseCookie } from '@lib/utils/cookies';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function Page() {
  const router = useRouter();
  const loginContext = useLoginContext();
  const { resetAuthState } = useResetAuthState();
  const oaCookieRef = useRef(parseCookie<OAuthClientMetaData>(getCookie(OAUTH_CLIENT_META_COOKIE)));
  const loginFlowContextCookie = useRef(getCookie(OAUTH_LOGIN_FLOW_CONTEXT_COOKIE) as string);
  const mfaFactorsCookie = useRef(parseCookie<MfaFactors>(getCookie(OAUTH_MFA_FACTORS_REQUIRED_COOKIE)));
  const mfaEnabled = !!loginFlowContextCookie.current && !!mfaFactorsCookie.current;
  const magicApiKey = useStore(state => state.magicApiKey);

  const handleInitialization = async () => {
    await resetAuthState();

    if (mfaEnabled) {
      loginContext.setLoginState({
        ...loginContext,
        loginFlowContext: loginFlowContextCookie.current || '',
      });

      router.replace('/v1/oauth2/credential/create/enforce_mfa');
    } else {
      router.replace('/v1/oauth2/credential/create/resolve');
    }
  };

  useEffect(() => {
    if (magicApiKey) {
      handleInitialization();
    } else if (oaCookieRef.current?.magicApiKey) {
      useStore.setState({ magicApiKey: oaCookieRef.current?.magicApiKey || '' });
    } else {
      logger.error('Magic API key not found in cookies for OAuth credential create page');
    }
  }, [magicApiKey]);

  return null;
}
