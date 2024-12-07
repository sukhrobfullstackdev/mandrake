/* istanbul ignore file */

import LoginFormPage from '@app/send/rpc/wallet/mc_login/connect-with-ui-login';
import { getServerQueryClient } from '@lib/server/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export default async function Page() {
  const queryClient = await getServerQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LoginFormPage />
    </HydrationBoundary>
  );
}
