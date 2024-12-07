import { OAUTH_CLIENT_META_COOKIE } from '@constants/cookies';
import { data as storageData } from '@lib/services/web-storage/data-api';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';

const MISSING_OAUTH_CLIENT_META_KEY = 'isMissingOAuthClientMeta';

export const useCheckSafariCookie = () => {
  const [isFinished, setIsFinished] = useState(false);

  /**
   * This asynchronous effect checks for the presence of an `_oaclientmeta`
   * cookie because Safari sometimes (falsely) flags us as a "bounce tracker"
   * when we redirect from the server-side OAuth callback step to the
   * client-side ID token step.
   *
   * !!!!!
   *  NOTE: This is probably only a short-term fix. We'll need to come up with a
   *  longer-lived alternative if Safari ever breaks this approach (assume they
   *  will).
   * !!!!!
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const oauthCookie = getCookie(OAUTH_CLIENT_META_COOKIE);

    if (!oauthCookie && !storageData.getItem(MISSING_OAUTH_CLIENT_META_KEY)) {
      storageData.setItem(MISSING_OAUTH_CLIENT_META_KEY, true);
      window.location.reload();
      return;
    }

    storageData.removeItem(MISSING_OAUTH_CLIENT_META_KEY);
    setIsFinished(true);
  }, []);

  return isFinished;
};
