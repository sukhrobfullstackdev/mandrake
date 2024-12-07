/* istanbul ignore file */

import Container from '@app/passport/container';
import { usePrefetchFlags } from '@hooks/common/launch-darkly';
import { getServerQueryClient } from '@lib/server/query-client';
import { LoadingSpinner } from '@magiclabs/ui-components';
import { Center } from '@styled/jsx';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getDecodedQueryParams } from '@utils/query-string';

export interface PassportProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Passport({ searchParams }: PassportProps) {
  const queryClient = await getServerQueryClient();

  // use decodeUriComponent to make sure the encoding of special characters like '='
  // are replaced with the actual characters.
  const encodedQueryParams = decodeURIComponent(searchParams.params as string);
  const decodedQueryParams = getDecodedQueryParams(encodedQueryParams);

  await usePrefetchFlags();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container encodedQueryParams={encodedQueryParams} decodedQueryParams={decodedQueryParams}>
        <Center mt="36vh">
          <LoadingSpinner size={56} strokeWidth={6} neutral />
        </Center>
      </Container>
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
