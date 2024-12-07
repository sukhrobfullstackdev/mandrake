'use client';

import { getQueryClient } from '@common/query-client';
import { NODE_ENV } from '@constants/env';
import { css } from '@styled/css';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface Props {
  children: React.ReactNode;
}

const QueryProvider = ({ children }: Props) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {NODE_ENV === 'development' && (
        <div className={css({ zIndex: 'token(zIndex.max)', position: 'relative' })}>
          <ReactQueryDevtools initialIsOpen={false} />
        </div>
      )}
    </QueryClientProvider>
  );
};

export default QueryProvider;
