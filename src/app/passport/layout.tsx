import { DefaultLayout } from '@components/default-layout';
import { usePrefetchFlags } from '@hooks/common/launch-darkly';
import { getServerQueryClient } from '@lib/server/query-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Magic Passport',
  description: 'Magic Passport',
};

export interface Props {
  children: React.ReactNode;
}

export default async function PassportLayout({ children }: Props) {
  const queryClient = await getServerQueryClient();
  await usePrefetchFlags();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DefaultLayout>{children}</DefaultLayout>
    </HydrationBoundary>
  );
}
