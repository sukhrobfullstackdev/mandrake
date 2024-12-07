import KernelClientService from '@app/passport/libs/tee/kernel-client';
import { Endpoint } from '@constants/endpoint';
import { MagicApiErrorCode } from '@constants/error';
import { HttpService } from '@lib/http-services';
import { ApiResponseError } from '@lib/http-services/core/api-response-error';
import {
  createNextErrorResponse,
  createNextResponse,
  NextResponseErrorMessage,
  surfaceApiErrorResponse,
} from '@lib/http-services/util/next-response';
import { Network } from 'magic-passport/types';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { eoaPublicAddress, accessToken, network } = body as {
    eoaPublicAddress: string;
    accessToken: string;
    network: Network;
  };

  if (!eoaPublicAddress) {
    console.error('EOA public address is missing. Please supply one.', {
      eoaPublicAddress,
    });
    return createNextErrorResponse(
      400,
      MagicApiErrorCode.INVALID_ARGUMENTS,
      NextResponseErrorMessage.InvalidArguments,
      { body },
    );
  }
  if (!accessToken) {
    console.error('Access token is missing. Please supply one.', {
      accessToken,
    });
    return createNextErrorResponse(
      400,
      MagicApiErrorCode.INVALID_ARGUMENTS,
      NextResponseErrorMessage.InvalidArguments,
      { body },
    );
  }
  if (!network) {
    console.error('Network is missing. Please supply one.', {
      network,
    });
    return createNextErrorResponse(
      400,
      MagicApiErrorCode.INVALID_ARGUMENTS,
      NextResponseErrorMessage.InvalidArguments,
      { body },
    );
  }
  try {
    const smartAccount = await KernelClientService.getSmartAccount({ eoaPublicAddress, accessToken, network });
    if (!smartAccount) throw new Error('Failed to get smart account');
    try {
      // associate user with a wallet / smart account address
      await HttpService.PassportIdentity.Patch(
        Endpoint.PassportIdentity.PassportUser,
        { ...request.headers, authorization: `Bearer ${accessToken}` },
        { public_address: smartAccount.address },
      );
      await KernelClientService.enableCab(smartAccount, network);
    } catch (e) {
      return surfaceApiErrorResponse(e as ApiResponseError);
    }
  } catch (e) {
    return createNextErrorResponse(
      500,
      MagicApiErrorCode.INTERNAL_SERVER_ERROR,
      NextResponseErrorMessage.SmartAccount,
      {
        body,
      },
    );
  }

  return createNextResponse({ success: true }, {});
}
