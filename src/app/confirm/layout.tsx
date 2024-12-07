/* istanbul ignore file */

import { EmailLinkConfirmProvider } from '@app/confirm/email-link-confirm-context';
import { LoginProvider } from '@app/send/login-context';
import NewTabContainer from '@components/new-tab/new-tab-container';
import { NewTabProvider } from '@components/new-tab/new-tab-context';
import { getServerQueryClient } from '@lib/server/query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default async function LoginWithEmailLinkConfirmLayout({ children }: Props) {
  const queryClient = await getServerQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LoginProvider>
        <NewTabProvider>
          <EmailLinkConfirmProvider>
            <NewTabContainer>{children}</NewTabContainer>
          </EmailLinkConfirmProvider>
        </NewTabProvider>
      </LoginProvider>
    </HydrationBoundary>
  );
}
