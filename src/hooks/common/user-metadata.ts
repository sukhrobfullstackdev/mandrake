import { type MagicUserMetadata } from '@custom-types/user';
import { WalletType } from '@custom-types/wallet';
import { useUserInfoQuery, userQueryKeys } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { generateUserId } from '@lib/decentralized-id/generate-user-id';
import { getWalletType } from '@lib/utils/network-name';
import { useEffect, useState } from 'react';

type UserUserMetadataReturn = {
  userMetadata: MagicUserMetadata | null;
  userMetadataError: string | null;
};

export const useUserMetadata = (enabled: boolean = true, isCachedNeeded: boolean = true): UserUserMetadataReturn => {
  const { authUserId, authUserSessionToken } = useStore(state => state);
  const { ethNetwork, ext } = useStore(state => state.decodedQueryParams);
  const email = useStore(state => state.email);
  const phoneNumber = useStore(state => state.phoneNumber);
  const [userMetadata, setUserMetadata] = useState<MagicUserMetadata | null>(null);
  const [userMetadataError, setUserMetadataError] = useState<string | null>(null);
  const walletType = getWalletType(ethNetwork, ext);

  const { data: ethUserInfoData, error: ethUserInfoError } = useUserInfoQuery(
    userQueryKeys.info({
      authUserId: authUserId!,
      authUserSessionToken: authUserSessionToken!,
      walletType: WalletType.ETH,
    }),
    {
      enabled: !!authUserId && !!authUserSessionToken && enabled,
      refetchOnMount: 'always',
      gcTime: isCachedNeeded ? 1000 * 60 * 5 : 0,
    },
  );

  const { data: multichainUserInfoData, error: multichainUserInfoError } = useUserInfoQuery(
    userQueryKeys.info({
      authUserId: authUserId!,
      authUserSessionToken: authUserSessionToken!,
      walletType,
    }),
    {
      enabled: !!authUserId && !!authUserSessionToken && enabled && walletType !== WalletType.ETH && !!ethUserInfoData,
      refetchOnMount: 'always',
      gcTime: isCachedNeeded ? 1000 * 60 * 5 : 0,
    },
  );

  // generate user metadata when user info is fetched
  useEffect(() => {
    const userInfoData = walletType === WalletType.ETH ? ethUserInfoData : multichainUserInfoData;
    if (userInfoData && ethUserInfoData) {
      generateUserId(ethUserInfoData.publicAddress).then(issuer => {
        setUserMetadata({
          issuer: issuer ?? null,
          publicAddress: userInfoData.publicAddress,
          email: ethUserInfoData?.email?.toLowerCase() ?? email?.toLowerCase() ?? null,
          phoneNumber: ethUserInfoData?.phoneNumber ?? phoneNumber ?? null,
          isMfaEnabled: userInfoData.authUserMfaActive,
          recoveryFactors: userInfoData.recoveryFactors,
        });
      });
    }
  }, [ethUserInfoData, multichainUserInfoData]);

  useEffect(() => {
    if (ethUserInfoError || multichainUserInfoError) {
      logger.error('Error fetching user info', ethUserInfoError || multichainUserInfoError);
      setUserMetadataError('There was an error generating user metadata');
    }
  }, [ethUserInfoError, multichainUserInfoError]);

  return {
    userMetadata,
    userMetadataError,
  };
};
