'use client';

import { useCreateDidTokenForUser } from '@hooks/common/create-did-token-for-user';
import { useHydrateOrCreateWallets } from '@hooks/common/hydrate-or-create-wallets';
import { useResolveActiveRpcRequest } from '@hooks/common/json-rpc-request';
import { useWalletInfoQuery, walletQueryKeys } from '@hooks/data/embedded/wallet';
import { useStore } from '@hooks/store';
import { AtomicRpcPayloadService } from '@lib/atomic-rpc-payload';
import { useTranslation } from '@lib/common/i18n';
import { MagicPayloadMethod } from '@magic-sdk/types';
import { Button, IcoCheckmarkCircleFill, LoadingSpinner, Page, Text } from '@magiclabs/ui-components';
import { usePathname } from 'next/navigation';
import { VStack } from '@styled/jsx';

import { token } from '@styled/tokens';

import { DEFAULT_TOKEN_LIFESPAN } from '@constants/did-token';
import { ETH_REQUESTACCOUNTS } from '@constants/eth-rpc-methods';
import { WalletType } from '@custom-types/wallet';
import { useSendRouter } from '@hooks/common/send-router';
import React, { useEffect, useState } from 'react';

// TODO creating your account vs finishing up to delineate between new / exisiting users
export default function CreateWallet({ pageIcon }: { pageIcon: React.ReactNode }) {
  const { t } = useTranslation('send');
  const pathname = usePathname();
  const router = useSendRouter();
  const { areWalletsCreated, walletCreationError } = useHydrateOrCreateWallets();
  const resolveActiveRpcRequest = useResolveActiveRpcRequest();
  const activeRpcPayload = AtomicRpcPayloadService.getActiveRpcPayload();

  const { didToken, error: didTokenError } = useCreateDidTokenForUser({
    enabled: !walletCreationError && areWalletsCreated,
    lifespan: activeRpcPayload?.params[0]?.lifespan || DEFAULT_TOKEN_LIFESPAN,
  });
  const { authUserSessionToken, authUserId } = useStore(state => state);

  const [hasResolvedOrRejected, setHasResolvedOrRejected] = useState(false);

  const { data: walletInfoData } = useWalletInfoQuery(
    walletQueryKeys.info({
      authUserId: authUserId!,
      walletType: WalletType.ETH,
      authUserSessionToken: authUserSessionToken!,
    }),
    {
      enabled: !!authUserId && !!authUserSessionToken,
    },
  );

  useEffect(() => {
    if (hasResolvedOrRejected || !walletInfoData) return;
    if (didToken && activeRpcPayload) {
      AtomicRpcPayloadService.logPagePerformanceMetrics(pathname);
      // For connectWithUI, emit didToken & resolve with public address
      if (activeRpcPayload.method === MagicPayloadMethod.Login || activeRpcPayload.method === ETH_REQUESTACCOUNTS) {
        AtomicRpcPayloadService.emitJsonRpcEventResponse('id-token-created', [{ idToken: didToken }]);
        resolveActiveRpcRequest([walletInfoData.publicAddress as string]);
        return setHasResolvedOrRejected(true);
      }
      // For other RPC methods, resolve with didToken
      resolveActiveRpcRequest(didToken);
      setHasResolvedOrRejected(true);
    }
  }, [walletInfoData, didToken, activeRpcPayload, hasResolvedOrRejected, resolveActiveRpcRequest]);

  useEffect(() => {
    if (walletCreationError || didTokenError) {
      logger.error(`Error in create wallet or did token:`, { error: walletCreationError ?? didTokenError });
    }
  }, [walletCreationError, didTokenError]);

  const renderComponent = () => {
    if (didToken && areWalletsCreated) {
      return <IcoCheckmarkCircleFill height={36} width={36} color={token('colors.brand.base')} />;
    }
    if (walletCreationError || didTokenError) {
      return null;
    }
    return <LoadingSpinner size={36} strokeWidth={4} />;
  };

  const handleTryAgain = () => {
    router.replace(`/send/rpc/auth/${activeRpcPayload?.method}`);
  };

  return (
    <>
      <Page.Icon>{pageIcon}</Page.Icon>
      <Page.Content>
        <VStack gap={24}>{renderComponent()}</VStack>

        <VStack gap={6}>
          {walletCreationError || didTokenError ? (
            <>
              <Text styles={{ textAlign: 'center' }}> {t('An unexpected error occurred. Please try again')}</Text>
              <Button onPress={handleTryAgain} variant="primary" size="md" label={t('Try Again')} />
            </>
          ) : (
            <Text
              styles={{
                color: token('colors.text.tertiary'),
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              {t('Confirming Login')}...
            </Text>
          )}
        </VStack>
      </Page.Content>
    </>
  );
}
