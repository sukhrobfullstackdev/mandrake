'use server';

import { SEND_CONTEXT_COOKIE } from '@constants/cookies';
import { useStore } from '@hooks/store';
import { getDecodedQueryParams } from '@lib/utils/query-string';
import { cookies } from 'next/headers';

export const getServerApiKey = async () => {
  let apiKey = useStore.getState().magicApiKey || '';

  if (!apiKey) {
    const contextCookie = JSON.parse(cookies().get(SEND_CONTEXT_COOKIE)?.value || '{}');
    apiKey = contextCookie?.magicApiKey || '';
    await useStore.setState({ magicApiKey: apiKey });
  }

  return apiKey;
};

export const getServerDecodedQueryParams = async () => {
  let decodedQueryParams = useStore.getState().decodedQueryParams || '';

  if (!decodedQueryParams) {
    const contextCookie = JSON.parse(cookies().get(SEND_CONTEXT_COOKIE)?.value || '{}');
    const decodedParams = contextCookie?.encodedQueryParams
      ? getDecodedQueryParams(contextCookie?.encodedQueryParams)
      : null;

    decodedQueryParams = {
      ...decodedParams,
    };

    await useStore.setState({ decodedQueryParams });
  }

  return decodedQueryParams;
};
