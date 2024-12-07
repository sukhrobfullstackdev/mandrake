'use client';

import { useResetAuthState } from '@hooks/common/auth-state';
import { useUserLogoutQuery } from '@hooks/data/embedded/user';
import { useStore } from '@hooks/store';
import { useTranslation } from '@lib/common/i18n';
import { dispatchPhantomClearCacheKeys } from '@lib/legacy-relayer/dispatch-phantom-clear-cache-keys';
import { IcoCheckmarkCircleFill, Page, Text } from '@magiclabs/ui-components';
import { VStack } from '@styled/jsx';
import { useEffect } from 'react';

export default function MwsLogoutPage() {
  const { t } = useTranslation('send');
  const { authUserId } = useStore(state => state);
  const { resetAuthState } = useResetAuthState();

  const handleLogout = async () => {
    dispatchPhantomClearCacheKeys();
    await resetAuthState();
  };

  const { mutate: mutateUserLogout } = useUserLogoutQuery();

  useEffect(() => {
    if (authUserId) {
      mutateUserLogout(
        { authUserId },
        {
          onSuccess: handleLogout,
          onError: handleLogout,
        },
      );
    }
  }, [authUserId]);

  return (
    <>
      <Page.Icon>
        <IcoCheckmarkCircleFill />
      </Page.Icon>

      <Page.Content>
        <VStack gap={2}>
          <Text.H4>{t('Logout Successful')}</Text.H4>
          <Text>{t('You can now close this tab.')}</Text>
        </VStack>
      </Page.Content>
    </>
  );
}
