import { LoginProvider } from '@app/send/login-context';
import { OAuthProvider } from '@app/send/rpc/oauth/magic_oauth_login_with_popup/context';
import { getServerQueryClient } from '@lib/server/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
  const queryClient = await getServerQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OAuthProvider>
        <LoginProvider>{children}</LoginProvider>
      </OAuthProvider>
    </HydrationBoundary>
  );
}
