import { LoginProvider } from '@app/send/login-context';
import { getServerQueryClient } from '@lib/server/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { OAuthProvider } from './oauth-context';

interface Props {
  children: React.ReactNode;
}

export default async function OAuthVerifyLayout({ children }: Props) {
  const queryClient = await getServerQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OAuthProvider>
        <LoginProvider>{children}</LoginProvider>
      </OAuthProvider>
    </HydrationBoundary>
  );
}
