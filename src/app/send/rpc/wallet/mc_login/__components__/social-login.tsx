'use client';

import { RELAYER_LAST_LOGGED_IN_WITH_METHOD } from '@app/send/rpc/wallet/mc_login/constants';
import { OAuthPopupStartUrlParams } from '@custom-types/oauth';
import { PopupMessageData, PopupMessageMethod } from '@custom-types/popup';
import { SocialWidgetPopupResponse } from '@custom-types/social-widgets';
import { useSetAuthState } from '@hooks/common/auth-state';
import { useFlags } from '@hooks/common/launch-darkly';
import { useSendRouter } from '@hooks/common/send-router';
import { useOAuthAppQuery } from '@hooks/data/embedded/magic-client';
import { useStore } from '@hooks/store';
import { openPopupGetResponse } from '@lib/common/popup';
import { LoadingSpinner, SocialLoginButton } from '@magiclabs/ui-components';
import { Flex } from '@styled/jsx';
import qs from 'qs';
import { useState } from 'react';

export default function SocialLoginPage() {
  const router = useSendRouter();
  const flags = useFlags();
  const [isLoading, setIsLoading] = useState(false);
  const { hydrateAndPersistAuthState } = useSetAuthState();
  const { sdkMetaData, magicApiKey } = useStore.getState();
  const provider = 'google';

  const { data: oauthAppDataArray, isFetching: oauthAppFetching } = useOAuthAppQuery({ provider });
  const oauthAppData = oauthAppDataArray?.[0] || null;

  const handleSocialLoginClick = async () => {
    setIsLoading(true);

    const queryParams: OAuthPopupStartUrlParams = {
      magicApiKey: magicApiKey || '',
      platform: 'web',
      dpop: sdkMetaData?.webCryptoDpopJwt || '',
      oauthId: oauthAppData?.id || '',
      oauthAppId: oauthAppData?.appId || '',
      oauthAppRedirectId: oauthAppData?.redirectId || '',
    };

    let popupData: PopupMessageData<SocialWidgetPopupResponse> | null;

    // open popup and wait for response
    try {
      popupData = await openPopupGetResponse<SocialWidgetPopupResponse>({
        url: new URL(`/oauth2/popup/start/${provider}?${qs.stringify(queryParams)}`, window.origin).href,
        method: PopupMessageMethod.MAGIC_POPUP_OAUTH_VERIFY_RESPONSE,
      });
    } catch (err: unknown) {
      logger.error('An error was returned by social widget popup', {
        errorMessage: (err as Error).message,
        provider,
        method: PopupMessageMethod.MAGIC_POPUP_OAUTH_VERIFY_RESPONSE,
      });

      setIsLoading(false);
      return;
    }

    if (!popupData?.payload?.verifyData) {
      logger.error('No data was returned by social widget popup');
      setIsLoading(false);
      return;
    }

    const { verifyData, requestOriginMessage } = popupData.payload;
    const { authUserSessionToken, authUserId, refreshToken, userInfo } = verifyData;

    await hydrateAndPersistAuthState({
      authUserId,
      authUserSessionToken,
      refreshToken,
      requestOriginMessage,
      email: userInfo?.email || '',
    });

    localStorage.setItem(RELAYER_LAST_LOGGED_IN_WITH_METHOD, provider);
    router.replace('/send/rpc/wallet/mc_login/wallet');
  };

  return (
    <Flex direction="column" alignItems="center" gap={5} w="full">
      {!!oauthAppData?.id && flags?.socialWidgetsV2?.enabled && !isLoading && (
        <SocialLoginButton provider={provider} onPress={handleSocialLoginClick} validating={isLoading} expand />
      )}
      {(isLoading || oauthAppFetching) && <LoadingSpinner size={36} strokeWidth={4} />}
    </Flex>
  );
}
