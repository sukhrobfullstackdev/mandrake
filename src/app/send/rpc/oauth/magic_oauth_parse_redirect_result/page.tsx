/* istanbul ignore file */

import { getServerQueryClient } from '@lib/server/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import OAuthRedirectStart from './oauth-redirect-result';

export default async function Page() {
  const queryClient = await getServerQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OAuthRedirectStart />
    </HydrationBoundary>
  );
}
