import { getServerQueryClient } from '@lib/server/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { PassportProvider } from '@app/passport/rpc/passport-context';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const queryClient = await getServerQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PassportProvider>{children}</PassportProvider>
    </HydrationBoundary>
  );
}
