import { NextRequest, NextResponse } from 'next/server';

import { LEGACY_APP_URL } from '@constants/env';
import { contentSecurityPolicyMiddleware } from './middlewares/content-security-policy';
import { oauthPopupMiddleware } from './middlewares/oauth-popup';

export interface ResponseConfig {
  request: {
    headers: Headers;
  };
}

export default async function middleware(request: NextRequest) {
  // sets custom headers for all routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  const resConfig = {
    request: {
      headers: requestHeaders,
    },
  } as ResponseConfig;

  // Set server metadata cookie for OAuth popup flows
  if (request.nextUrl.pathname.startsWith('/oauth2/popup/start/')) {
    return oauthPopupMiddleware(request, resConfig);
  }

  if (request.nextUrl.pathname === '/send') {
    const res = await contentSecurityPolicyMiddleware(request, resConfig);
    if (res.status === 400) {
      const data = await res.json();
      if (data.error_code === 'INVALID_API_KEY' || data.error_code === 'API_KEY_IS_MISSING') {
        const errorPageUrl = new URL('/send/error/api_key_invalid_missing', request.nextUrl.origin);
        errorPageUrl.searchParams.set(
          'errorResponse',
          JSON.stringify({
            message: data.message,
            encodedQueryParam: request.nextUrl.searchParams.get('params'),
          }),
        );

        return NextResponse.redirect(errorPageUrl);
      }
      return res;
    }
    return res;
  }

  /**
   * !!important
   * Prod traffic is not yet routed through Mandrake for now, so this code is safe to be deployed on Prod
   * This is required when all traffic is routed through Mandrake.
   * Any requests not handled above will be proxied to the legacy Phantom server.
   */
  // proxy Everything else aside from the exclusion list to Phantom
  try {
    let origin;
    if (request.nextUrl.origin.includes('localhost')) {
      origin = 'http://localhost:3014';
    } else {
      origin = LEGACY_APP_URL;
    }
    const pathname = request.nextUrl.pathname;
    const targetUrl = `${origin}${pathname}${request.nextUrl.search}`;

    /** Redirect OAuthV1 start and callback routes to Phantom
      '/v1/oauth2/:provider/start',
      '/v1/oauth2/:oauth_redirect_id/callback',
     **/
    console.log(`Request: ${pathname} headers`, { headers: request.headers });
    console.log(`Request: ${pathname} cookies`, { cookies: request.cookies });
    if (/^\/v1\/oauth2\/.*?\/(start|callback)$/g.test(pathname)) {
      console.log(`Redirecting request from ${request.nextUrl.origin}${pathname} to Phantom:`, targetUrl);
      return NextResponse.redirect(targetUrl);
    }

    /**
     * Proxy requests to Phantom
     **/
    console.log(`Proxying request from ${request.nextUrl.origin}${pathname} to Phantom:`, targetUrl);

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(requestHeaders.entries()),
        ...(process.env.VERCEL_ENV === 'preview'
          ? {
              'CF-Access-Client-Id': process.env.CLOUDFLARE_ACCESS_CLIENT_ID,
              'CF-Access-Client-Secret': process.env.CLOUDFLARE_ACCESS_CLIENT_SECRET,
            }
          : {}),
      }, // Forward all original request headers
      body: request.body,
    });

    if (response.ok) {
      console.log(`Phantom Request ${targetUrl} successful`);
    } else {
      console.error(`Phantom Request ${targetUrl} failed`, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        error: response.statusText,
      });
    }

    // Return the response from the external API to the client
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Phantom Request Proxy failed', error);
    return NextResponse.json({ error: 'Error while proxying request' }, { status: 500 });
  }
}

export const config = {
  // Caveat: Using concatenated Array might cause all traffic routed to Phantom
  // Conditional expression is not allowed here
  matcher: [
    /* Match all request paths start /oauth2/popup/start/ */
    '/oauth2/popup/start',
    '/oauth2/popup/start/:path*',

    /* Match all request paths matches /send */
    '/send',

    /**
     *  These URLs will be routed to Phantom.
     *  Prod is safe as these traffic doesn't
     */
    // OAuth V1
    '/v1/oauth2/:provider/start',
    '/v1/oauth2/:oauth_redirect_id/callback',
    '/v1/oauth2/credential/send',
    '/v1/oauth2/error/send',
    '/v1/oauth2/user/info/retrieve',

    // These two urls have been migrated to Mandrake
    //'/v1/oauth2/credential/create',
    //'/v1/oauth2/credential/create/resolve'

    // OAuth V2 Detour
    '/v2/oauth2/:provider/start',

    // Default Session Management
    '/v1/session/persist',
    '/v1/session/refresh',

    // NFT transfer
    '/v1/confirm-nft-transfer',

    // Utilities
    '/send-legacy',
    '/preview/:path*',
    '/sdk/',
    '/sdk/:path*',
    '/pnp/:path*',
    '/liveness',
    '/healthz',

    // Local Phantom
    '/__local_dev__/:path*',
    '/__webpack_hmr',
  ],
};
