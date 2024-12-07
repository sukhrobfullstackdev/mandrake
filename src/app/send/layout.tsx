/* istanbul ignore file */
import LegacyIframe from '@components/legacy-iframe';
import { getServerQueryClient } from '@lib/server/query-client';
import { css } from '@styled/css';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export interface Props {
  children: React.ReactNode;
}

// Don't add fetch here. As this is a server component that would run in sync,
// adding fetch here would add extra response time to all rpc pages.
export default async function SendLayout({ children }: Props) {
  const queryClient = await getServerQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LegacyIframe />
      {/* this zIndex will ensure mandrake doesn't get covered by phantom if both are visible */}
      <div className={css({ zIndex: 'token(zIndex.max)', position: 'relative' })}>{children}</div>
    </HydrationBoundary>
  );
}
