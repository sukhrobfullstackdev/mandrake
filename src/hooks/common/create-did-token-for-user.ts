import { useClientId } from '@hooks/common/client-config';

import { RpcErrorCode, RpcErrorMessage } from '@constants/json-rpc';
import { useRejectActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useFlags } from '@hooks/common/launch-darkly';
import { useSendRouter } from '@hooks/common/send-router';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { DEFAULT_TOKEN_LIFESPAN, createDIDToken } from '@lib/decentralized-id/create-did-token';
import { DkmsService } from '@lib/dkms';
import { useEffect, useState } from 'react';

export type UseCreateDidTokenForUserParams = {
  enabled?: boolean;
  lifespan?: number;
  attachment?: string;
};

export type UseCreateDidTokenForUserReturn = {
  didToken: string | null;
  error: string | null;
};

export const useCreateDidTokenForUser = ({
  enabled,
  lifespan = DEFAULT_TOKEN_LIFESPAN,
  attachment,
}: UseCreateDidTokenForUserParams = {}): UseCreateDidTokenForUserReturn => {
  const [didToken, setDidToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { authUserId, authUserSessionToken, systemClockOffset } = useStore(state => state);
  const { clientId, error: clientIdError } = useClientId();
  const rejectActiveRpcRequest = useRejectActiveRpcRequest();
  const flags = useFlags();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();
  const router = useSendRouter();

  // This is designed for the ability to override the lifespan, exclusively for Polymarket
  // "On" will return 7 days in seconds and "Off" will return 0 and fall back to the default 15 mins
  // TODO: Remove this when SDK lifespan customization has been implemented PDEEXP-1660
  const lifespanOverride = flags?.adhocCustomDidLifespan || lifespan;

  useEffect(() => {
    if (clientIdError) {
      logger.error('create-did-token - Error fetching client config', clientIdError);
      if (activeRpcPayload?.params?.[0]?.showUI) {
        return router.replace('/send/error/config');
      } else {
        return rejectActiveRpcRequest(RpcErrorCode.InternalError, RpcErrorMessage.FailedToFetchConfig);
      }
    }

    const createToken = async () => {
      if (!authUserId || !authUserSessionToken) return;

      try {
        const { privateKey: decryptedPrivateKey, walletInfoData } = await DkmsService.reconstructSecretWithUserSession({
          authUserId,
          authUserSessionToken,
        });

        const account = {
          privateKey: decryptedPrivateKey,
          address: walletInfoData.publicAddress,
        };

        const audience = clientId;

        const token = await createDIDToken({
          account,
          audience,
          subject: authUserId,
          lifespan: lifespanOverride,
          attachment,
          systemClockOffset,
        });
        setDidToken(token);
      } catch (err: unknown) {
        const message = 'Error Fetching data needed for DID Token';
        logger.error(`${message} ${(err as Error).message}`, err);
        setError(message);
      }
    };

    if (enabled && clientId) {
      createToken();
    }
  }, [enabled, clientId, authUserId, authUserSessionToken]);

  return {
    didToken,
    error,
  };
};
