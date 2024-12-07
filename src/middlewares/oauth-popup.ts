import { OAUTH_SERVER_META_COOKIE } from '@constants/cookies';
import { NextRequest, NextResponse } from 'next/server';

export interface ResponseConfig {
  request: {
    headers: Headers;
  };
}

export const oauthPopupMiddleware = (request: NextRequest, responseConfig: ResponseConfig) => {
  const searchParams = new URLSearchParams(request.nextUrl.search);
  const { magicApiKey, dpop, platform, oauthId, oauthAppId, oauthAppRedirectId } = Object.fromEntries(searchParams);

  const response = NextResponse.next(responseConfig);

  // set server metadata cookie
  response.cookies.set({
    name: OAUTH_SERVER_META_COOKIE,
    value: JSON.stringify({ magicApiKey, dpop, platform, oauthId, oauthAppId, oauthAppRedirectId }),
    httpOnly: true,
    secure: true,
    partitioned: true,
  });

  // remove sensitive query params
  const nextUrl = request.nextUrl;
  nextUrl.searchParams.delete('dpop');
  nextUrl.searchParams.delete('magicApiKey');

  return NextResponse.rewrite(nextUrl, response);
};
