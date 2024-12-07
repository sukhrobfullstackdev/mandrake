/* istanbul ignore file */
import { getServerQueryClient } from '@lib/server/query-client';
import { css } from '@styled/css';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export interface MagicApiWalletLayoutProps {
  children: React.ReactNode;
}

// Don't add fetch here. As this is a server component that would run in sync,
// adding fetch here would add extra response time to all rpc pages.
export default async function MagicApiWalletLayout({ children }: MagicApiWalletLayoutProps) {
  const queryClient = await getServerQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className={css({ zIndex: 'token(zIndex.max)', position: 'relative' })}>{children}</div>
    </HydrationBoundary>
  );
}
