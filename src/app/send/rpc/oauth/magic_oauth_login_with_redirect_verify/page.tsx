'use client';

import { useLoginContext } from '@app/send/login-context';
import { RPC_ROUTE } from '@app/send/rpc/oauth/magic_oauth_login_with_redirect_verify/constants';
import { useOAuthContext } from '@app/send/rpc/oauth/magic_oauth_login_with_redirect_verify/oauth-context';
import { OAuthVerify } from '@components/oauth/oauth-verify';
import { OAuthFinishedResult } from '@custom-types/oauth';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useSendRouter } from '@hooks/common/send-router';
import { OAuthVerifyResponse } from '@hooks/data/embedded/oauth';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { RPCErrorCode } from '@magic-sdk/types';
import { usePathname } from 'next/navigation';
import { useCallback, useRef } from 'react';

export type OAuthVerifyParams = [
  {
    authorizationResponseParams: string;
    magicApiKey: string;
    platform: string;
  },
];

export default function OauthVerifyPage() {
  const router = useSendRouter();
  const pathname = usePathname();

  const startTime = useRef(performance.now());
  const { metaData } = useOAuthContext();
  const loginContext = useLoginContext();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const { authorizationResponseParams } = (activeRpcPayload?.params as OAuthVerifyParams)?.[0] || {};
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();

  // Once verification is complete, resolve the OAuth flow
  const onVerifyFinished = useCallback(
    (result: OAuthFinishedResult<OAuthVerifyResponse>) => {
      if (!result.isSuccess) {
        logger.error('OAuth verify error', {
          timeToError: Math.round(performance.now() - startTime.current),
          oauthStep: 'verify',
          code: result.data.errorCode,
          message: result.data.errorMessage,
          provider: metaData?.provider,
          redirectUri: metaData?.redirectUri,
        });

        rejectActiveRpcRequest(RPCErrorCode.InvalidRequest, result.data.errorMessage);
      }

      if (result.mfaEnabled) {
        loginContext.setLoginState({
          ...loginContext,
          loginFlowContext: result.data.loginFlowContext || '',
        });

        AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
        router.replace(`${RPC_ROUTE}/enforce_mfa`);
        return;
      }

      if (result.isSuccess) {
        logger.info('OAuth verify success', {
          timeToSuccess: Math.round(performance.now() - startTime.current),
          oauthStep: 'verify',
          result: result.data,
          provider: metaData?.provider,
          redirectUri: metaData?.redirectUri,
        });

        AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
        router.replace(`${RPC_ROUTE}/resolve`);
      }
    },
    [metaData],
  );

  return (
    Boolean(metaData) && (
      <OAuthVerify
        redirectUri={metaData?.redirectUri || ''}
        authorizationResponseParams={authorizationResponseParams}
        state={metaData?.state || ''}
        codeVerifier={metaData?.codeVerifier || ''}
        appID={metaData?.appID || ''}
        onFinished={onVerifyFinished}
      />
    )
  );
}
