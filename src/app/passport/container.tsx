'use client';

import { PassportInternalErrorMessage } from '@constants/error';
import { PassportPageErrorCodes } from '@constants/passport-page-errors';
import { PASSPORT_ERROR_URL } from '@constants/routes';
import { usePassportRouter } from '@hooks/common/passport-router';
import { usePassportConfigQuery } from '@hooks/data/passport/app-config';
import { PassportStoreState, usePassportStore } from '@hooks/data/passport/store';
import { DecodedQueryParams } from '@hooks/store';
import { useStoreSync } from '@hooks/store/sync';
import { PopupAtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import { PopupMessageRelayer } from '@lib/message-channel/popup/popup-message-relayer';
import { getDecodedQueryParams } from '@lib/utils/query-string';
import { useCustomVars } from '@magiclabs/ui-components';
import { useEffect, useRef } from 'react';

interface ContainerProps {
  decodedQueryParams: DecodedQueryParams;
  encodedQueryParams: string;
  children?: React.ReactNode;
}

export default function Container({ encodedQueryParams, decodedQueryParams, children }: ContainerProps) {
  // sync global stores
  useStoreSync(usePassportStore, { decodedQueryParams } as PassportStoreState);

  const { magicApiKey } = usePassportStore(state => state);

  const { setRadius } = useCustomVars({});

  const { data: clientConfig, error } = usePassportConfigQuery(
    {
      magicApiKey: getDecodedQueryParams(encodedQueryParams).apiKey || magicApiKey || '',
    },
    { enabled: !!getDecodedQueryParams(encodedQueryParams).apiKey || !!magicApiKey },
  );

  const messageRelayer = useRef<PopupMessageRelayer>();
  const router = usePassportRouter();

  useEffect(() => {
    setRadius('button', '14px');
    if (!clientConfig && !error) return;

    const errorData = ((error as ApiResponseError)?.cause as { detail: string }) || {};
    const isApiKeyInvalid = errorData?.detail?.includes(PassportInternalErrorMessage.INVALID_API_KEY);

    if (isApiKeyInvalid) {
      router.replace(PASSPORT_ERROR_URL(PassportPageErrorCodes.INVALID_API_KEY));
      return;
    } else if (error || !decodedQueryParams.network) {
      router.replace(PASSPORT_ERROR_URL(PassportPageErrorCodes.TECHNICAL_ERROR));
      return;
    }
    if (messageRelayer.current) return;
    PopupAtomicRpcPayloadService.setEncodedQueryParams(encodedQueryParams);
    messageRelayer.current = new PopupMessageRelayer(router, encodedQueryParams);
  }, [clientConfig, error]);

  useEffect(() => {
    // encoded query params must be in state before we prefetch flags
    usePassportStore.setState({
      decodedQueryParams,
    });
  }, []);

  return <>{children}</>;
}
