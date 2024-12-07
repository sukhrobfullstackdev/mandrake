/* istanbul ignore file */
import NewTabContainer from '@components/new-tab/new-tab-container';
import { NewTabProvider } from '@components/new-tab/new-tab-context';
import { getServerQueryClient } from '@lib/server/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export interface Props {
  children: React.ReactNode;
}

export default async function ConfirmActionLayout({ children }: Props) {
  const queryClient = await getServerQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NewTabProvider>
        <NewTabContainer>{children}</NewTabContainer>
      </NewTabProvider>
    </HydrationBoundary>
  );
}
