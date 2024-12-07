/* istanbul ignore file */

import { getServerQueryClient } from '@lib/server/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export default async function LogoutLayout({ children }: { children: React.ReactNode }) {
  const queryClient = await getServerQueryClient();

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
