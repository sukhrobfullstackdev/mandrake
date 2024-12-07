'use client';

import { GOOGLE_SIGN_IN_CLIENT_ID } from '@constants/env';
import { useSendRouter } from '@hooks/common/send-router';
import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { GoogleSignInResponse } from '@hooks/data/embedded/sign-in-with-google';
import { useStore } from '@hooks/store';
import { Box } from '@styled/jsx';
import Script from 'next/script';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export default function GoogleSignInPage() {
  const { data: clientConfigData, error: clientConfigError } = useClientConfigQuery(
    { magicApiKey: useStore.getState().magicApiKey || '' },
    { enabled: !!useStore.getState().magicApiKey },
  );
  const isDarkTheme = clientConfigData?.clientTheme.themeColor === 'dark';
  const googleButtonDefaultWidth = 304;
  const googleContainerRef = useRef<HTMLDivElement>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(googleButtonDefaultWidth);

  const router = useSendRouter();

  // Google only has script tags for their lib
  const renderGoogleSignInScript = () => {
    return (
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onLoad={() => (window as any).google.accounts.id.initialize({ client_id: GOOGLE_SIGN_IN_CLIENT_ID })}
      />
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderGoogleButton = (goog: any) => {
    goog.accounts.id.renderButton(document.getElementById('googleButton'), {
      theme: isDarkTheme ? 'filled_black' : 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: googleButtonWidth,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initializeGoogle = (goog: any) => {
    goog.accounts.id.initialize({
      client_id: GOOGLE_SIGN_IN_CLIENT_ID,
      auto_select: false,
      close_on_tap_outside: false,
      use_fedcm_for_prompt: true,
      callback: (result: GoogleSignInResponse) =>
        router.replace(
          `/send/rpc/wallet/mc_login/verify_google_sign_in?credential=${encodeURIComponent(result.credential)}`,
        ),
    });
  };

  useLayoutEffect(() => {
    // Need to wait for the script tag lib to load.
    const handle = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const goog = (window as any).google;
      if (!goog) return;
      initializeGoogle(goog);
      renderGoogleButton(goog);
      window.clearInterval(handle);
    }, 100);
    return () => window.clearInterval(handle);
  }, [googleButtonWidth]);

  useEffect(() => {
    if (clientConfigError) {
      logger.error('GoogleSignIn - Error fetching client config', clientConfigError);
      return router.replace('/send/error/config');
    }
  }, [clientConfigError]);

  /**
   * SIWG button does not resize once rendered.
   * To make button responsive, need to
   * re-render it when the window resizes.
   */
  useEffect(() => {
    const modalBreakpoint = 768;
    const googleContainer = googleContainerRef.current;
    if (!googleContainer) return;
    const resizeWindow = new ResizeObserver(() => {
      if (window.innerWidth >= modalBreakpoint) {
        setGoogleButtonWidth(googleButtonDefaultWidth);
      } else {
        setGoogleButtonWidth(googleContainer.offsetWidth);
      }
    });
    resizeWindow.observe(document.body);
    return () => resizeWindow.disconnect();
  }, []);

  return (
    <Box
      id="googleContainer"
      aria-label="googleContainer"
      ref={googleContainerRef}
      style={{
        width: '100%',
        maxWidth: '25rem',
        margin: 'auto',
        height: '2.7rem',
        maxHeight: '2.7rem',
        overflow: 'hidden',
      }}
    >
      <div id="googleButton" />
      {renderGoogleSignInScript()}
    </Box>
  );
}
