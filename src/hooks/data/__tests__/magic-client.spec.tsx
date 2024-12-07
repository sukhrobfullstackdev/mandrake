import { useClientConfigQuery } from '@hooks/data/embedded/magic-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

const mockValue = {
  data: 'foo',
  message: 'bar',
  status: 'ok',
};

describe('@hooks/data/magic-client', () => {
  it('should fetch data', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => {
      const queryClient = new QueryClient();
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };

    const { result } = renderHook(() => useClientConfigQuery({ magicApiKey: 'test ' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockValue.data);
  });
});
